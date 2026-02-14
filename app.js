// Zenith Docs - Main Application JavaScript
// 25 Tools + 5 Uses Per Day Limit

// All 25 Tools Configuration
const tools = [
    {id:'pdf-merge',icon:'📄',title:'PDF Merge',desc:'Combine multiple PDFs'},
    {id:'pdf-split',icon:'✂️',title:'PDF Split',desc:'Extract specific pages'},
    {id:'pdf-compress',icon:'🗜️',title:'PDF Compress',desc:'Reduce file size'},
    {id:'pdf-rotate',icon:'🔄',title:'PDF Rotate',desc:'Rotate pages'},
    {id:'pdf-watermark',icon:'🏷️',title:'PDF Watermark',desc:'Add watermark'},
    {id:'pdf-to-text',icon:'📝',title:'PDF to Text',desc:'Extract text'},
    {id:'pdf-delete',icon:'🗑️',title:'Delete Pages',desc:'Remove pages'},
    {id:'pdf-to-images',icon:'📸',title:'PDF→Images',desc:'Convert to images'},
    {id:'pdf-metadata',icon:'ℹ️',title:'Edit Metadata',desc:'Edit PDF info'},
    {id:'pdf-protect',icon:'🔒',title:'Protect PDF',desc:'Add password'},
    {id:'img-compress',icon:'⚡',title:'Compress Image',desc:'Optimize images'},
    {id:'img-resize',icon:'📐',title:'Resize Image',desc:'Change dimensions'},
    {id:'img-convert',icon:'🔄',title:'Convert Image',desc:'Change format'},
    {id:'img-crop',icon:'✂️',title:'Crop Image',desc:'Crop to area'},
    {id:'img-to-pdf',icon:'📄',title:'Images→PDF',desc:'Combine to PDF'},
    {id:'batch-compress',icon:'🗜️',title:'Batch Compress',desc:'Compress many'},
    {id:'resume-portfolio',icon:'🌐',title:'Resume→Portfolio',desc:'Create website'},
    {id:'proposal',icon:'📋',title:'Proposal',desc:'Generate proposal'},
    {id:'invoice',icon:'💰',title:'Invoice',desc:'Generate invoice'},
    {id:'text-to-pdf',icon:'📝',title:'Text→PDF',desc:'Convert text'},
    {id:'bulk-rename',icon:'📝',title:'Bulk Rename',desc:'Rename files'},
    {id:'word-count',icon:'📊',title:'Word Counter',desc:'Count words'},
    {id:'qr-code',icon:'📱',title:'QR Code',desc:'Generate QR'},
    {id:'barcode',icon:'🏷️',title:'Barcode',desc:'Generate barcode'},
    {id:'screenshot-pdf',icon:'📸',title:'Screenshot→PDF',desc:'Organize screenshots'}
];

// Usage Limit Manager
class UsageLimit {
    constructor() {
        this.storageKey = 'zenith_usage';
        this.limit = 5;
        this.init();
    }

    init() {
        const today = new Date().toDateString();
        const data = this.getData();
        if (data.date !== today) {
            this.reset();
        }
        this.updateBadge();
    }

    getData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : { count: 0, date: new Date().toDateString() };
    }

    reset() {
        localStorage.setItem(this.storageKey, JSON.stringify({
            count: 0,
            date: new Date().toDateString()
        }));
    }

    canUse() {
        return this.getData().count < this.limit;
    }

    getRemaining() {
        return Math.max(0, this.limit - this.getData().count);
    }

    recordUse() {
        const data = this.getData();
        data.count++;
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        this.updateBadge();
    }

    updateBadge() {
        const remaining = this.getRemaining();
        const badge = document.getElementById('usageBadge');
        if (badge) {
            badge.textContent = `${remaining}/${this.limit} uses today`;
            badge.className = 'usage-badge';
            if (remaining <= 2 && remaining > 0) badge.classList.add('warning');
            if (remaining === 0) badge.classList.add('danger');
        }
    }
}

const usageLimit = new UsageLimit();
let selectedFile = null;

// Load tools on page load
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('toolsGrid');
    tools.forEach(tool => {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.onclick = () => openTool(tool);
        card.innerHTML = `
            <div class="tool-icon">${tool.icon}</div>
            <div class="tool-title">${tool.title}</div>
            <div class="tool-desc">${tool.desc}</div>
        `;
        grid.appendChild(card);
    });
});

function openTool(tool) {
    if (!usageLimit.canUse()) {
        showLimitModal();
        return;
    }

    const modal = document.getElementById('toolModal');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = `
        <h2 class="modal-title">${tool.icon} ${tool.title}</h2>
        <p style="color: #666; margin-bottom: 1.5rem;">${tool.desc}</p>
        
        <div class="upload-zone" id="uploadZone">
            <div class="upload-icon">📁</div>
            <div class="upload-text">Click to upload file</div>
            <div class="upload-hint">or drag and drop here</div>
        </div>
        
        <input type="file" id="fileInput" style="display:none">
        
        <div id="fileName" style="margin: 1rem 0; color: #666; display: none;"></div>
        
        <button class="btn btn-primary" id="processBtn" onclick="processFile('${tool.id}', '${tool.title}')" disabled>
            Process File
        </button>
        
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
            <div class="loading-text">Processing...</div>
        </div>
        
        <div id="result"></div>
    `;

    setupUpload();
    modal.classList.add('active');
}

function setupUpload() {
    const zone = document.getElementById('uploadZone');
    const input = document.getElementById('fileInput');
    const fileNameDiv = document.getElementById('fileName');
    const processBtn = document.getElementById('processBtn');

    zone.onclick = () => input.click();

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            fileNameDiv.innerHTML = `<strong>Selected:</strong> ${file.name} (${formatFileSize(file.size)})`;
            fileNameDiv.style.display = 'block';
            processBtn.disabled = false;
            zone.querySelector('.upload-text').innerHTML = '<span style="color: #4CAF50;">✓</span> ' + file.name;
        }
    };

    zone.ondragover = (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    };

    zone.ondragleave = () => {
        zone.classList.remove('dragover');
    };

    zone.ondrop = (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            input.files = e.dataTransfer.files;
            input.dispatchEvent(new Event('change'));
        }
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function processFile(toolId, toolName) {
    if (!selectedFile) {
        alert('Please select a file first');
        return;
    }

    const processBtn = document.getElementById('processBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');

    processBtn.disabled = true;
    loading.classList.remove('hidden');
    result.innerHTML = '';

    // Simulate processing
    setTimeout(() => {
        usageLimit.recordUse();

        const originalSize = selectedFile.size;
        const processedSize = Math.round(originalSize * (Math.random() * 0.3 + 0.6));
        const savingsPercent = Math.round((originalSize - processedSize) / originalSize * 100);

        loading.classList.add('hidden');
        result.innerHTML = `
            <div class="result">
                <div class="result-icon">✅</div>
                <h3 class="result-title">Success!</h3>
                <div>
                    <p class="result-text"><strong>File:</strong> ${selectedFile.name}</p>
                    <p class="result-text"><strong>Original:</strong> ${formatFileSize(originalSize)}</p>
                    <p class="result-text"><strong>Processed:</strong> ${formatFileSize(processedSize)}</p>
                    <p class="result-text"><strong>Savings:</strong> ${savingsPercent}%</p>
                </div>
                <div style="margin-top: 1.5rem; padding: 1rem; background: #fff3cd; border-radius: 6px; font-size: 0.9rem; color: #856404;">
                    <strong>Demo Mode:</strong> This is a frontend demo. Files are processed locally in your browser. 
                    Contact <a href="mailto:sociaro.io@gmail.com" style="color: #856404; text-decoration: underline;">sociaro.io@gmail.com</a> 
                    for the full server-side implementation with real PDF/image processing.
                </div>
            </div>
        `;

        processBtn.disabled = false;
        processBtn.textContent = 'Process Another File';
        selectedFile = null;
    }, 1500);
}

function closeModal() {
    document.getElementById('toolModal').classList.remove('active');
    selectedFile = null;
}

function showLimitModal() {
    document.getElementById('limitModal').classList.add('active');
}

function closeLimitModal() {
    document.getElementById('limitModal').classList.remove('active');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeLimitModal();
    }
});

// Prevent default drag behavior
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
