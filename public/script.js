// Complete Web Tools Application
class CompleteWebTools {
    constructor() {
        this.currentTheme = 'dark';
        this.currentService = null;
        this.currentCategory = null;
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.initializeTheme();
        this.initializeEventListeners();
        this.initializeServiceWorker();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.loadAvailableServices();
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = savedTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Event Listeners
    initializeEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                document.getElementById(target)?.scrollIntoView({ 
                    behavior: 'smooth' 
                });

                // Update active nav
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });

        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.getAttribute('data-category');
                const service = card.getAttribute('data-service');
                this.handleToolClick(category, service, card);
            });
        });

        // Close buttons
        document.getElementById('closeInput')?.addEventListener('click', () => {
            document.getElementById('inputSection').classList.add('hidden');
        });

        document.getElementById('closeResult')?.addEventListener('click', () => {
            document.getElementById('resultSection').classList.add('hidden');
        });

        // File upload
        this.initializeUploader();
    }

    // Handle tool card clicks
    handleToolClick(category, service, card) {
        this.currentCategory = category;
        this.currentService = service;

        // Add visual feedback
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Show appropriate input form
        this.showInputForm(category, service);
    }

    // Show input form based on category and service
    showInputForm(category, service) {
        const inputSection = document.getElementById('inputSection');
        const inputTitle = document.getElementById('inputTitle');
        const inputContent = document.getElementById('inputContent');

        inputTitle.textContent = this.getServiceName(service);

        let formHTML = '';

        switch(category) {
            case 'downloader':
                formHTML = this.getDownloaderForm(service);
                break;
            case 'games':
                formHTML = this.getGamesForm(service);
                break;
            case 'tools':
                formHTML = this.getToolsForm(service);
                break;
            case 'apk':
                formHTML = this.getApkForm(service);
                break;
            default:
                formHTML = '<p>Form not available for this service.</p>';
        }

        inputContent.innerHTML = formHTML;
        inputSection.classList.remove('hidden');

        // Add submit event listener
        const submitBtn = inputContent.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.processRequest());
        }
    }

    // Form generators for different categories
    getDownloaderForm(service) {
        return `
            <div class="input-group">
                <label class="input-label" for="urlInput">
                    <i class="fas fa-link"></i>
                    URL Media
                </label>
                <input type="url" id="urlInput" class="input-field" placeholder="https://example.com/video" required>
            </div>
            <button class="submit-btn">
                <i class="fas fa-download"></i>
                Download Media
            </button>
        `;
    }

    getGamesForm(service) {
        if (service === 'cc-sd') {
            return `
                <div class="input-group">
                    <label class="input-label" for="mataPelajaran">
                        <i class="fas fa-book"></i>
                        Mata Pelajaran
                    </label>
                    <select id="mataPelajaran" class="input-field" required>
                        <option value="">Pilih Mata Pelajaran...</option>
                        <option value="matematika">Matematika</option>
                        <option value="ipa">IPA</option>
                        <option value="ips">IPS</option>
                        <option value="bahasa_indonesia">Bahasa Indonesia</option>
                        <option value="bahasa_inggris">Bahasa Inggris</option>
                    </select>
                </div>
                <div class="input-group">
                    <label class="input-label" for="jumlahSoal">
                        <i class="fas fa-list-ol"></i>
                        Jumlah Soal (5-10)
                    </label>
                    <input type="number" id="jumlahSoal" class="input-field" min="5" max="10" value="5" required>
                </div>
                <button class="submit-btn">
                    <i class="fas fa-play"></i>
                    Mulai Quiz
                </button>
            `;
        }

        return `
            <div class="game-info">
                <p>Klik tombol di bawah untuk memulai game ${this.getServiceName(service)}</p>
            </div>
            <button class="submit-btn">
                <i class="fas fa-play"></i>
                Mulai Game
            </button>
        `;
    }

    getToolsForm(service) {
        if (service === 'npm') {
            return `
                <div class="input-group">
                    <label class="input-label" for="packageName">
                        <i class="fab fa-npm"></i>
                        Nama Package NPM
                    </label>
                    <input type="text" id="packageName" class="input-field" placeholder="contoh: axios" required>
                </div>
                <button class="submit-btn">
                    <i class="fas fa-search"></i>
                    Cek Package
                </button>
            `;
        }

        if (service === 'resi') {
            return `
                <div class="input-group">
                    <label class="input-label" for="resiNumber">
                        <i class="fas fa-barcode"></i>
                        Nomor Resi
                    </label>
                    <input type="text" id="resiNumber" class="input-field" placeholder="1234567890" required>
                </div>
                <div class="input-group">
                    <label class="input-label" for="courier">
                        <i class="fas fa-shipping-fast"></i>
                        Kurir
                    </label>
                    <select id="courier" class="input-field" required>
                        <option value="">Pilih Kurir...</option>
                        <option value="JNE">JNE</option>
                        <option value="JNT">J&T</option>
                        <option value="TIKI">TIKI</option>
                        <option value="POS">POS Indonesia</option>
                        <option value="SICEPAT">SiCepat</option>
                        <option value="ANTERAJA">AnterAja</option>
                        <option value="WAHANA">Wahana</option>
                        <option value="NINJA">Ninja Xpress</option>
                        <option value="LION">Lion Parcel</option>
                        <option value="REX">REX</option>
                    </select>
                </div>
                <button class="submit-btn">
                    <i class="fas fa-search"></i>
                    Lacak Paket
                </button>
            `;
        }

        return '<p>Form not available for this tool.</p>';
    }

    getApkForm(service) {
        return `
            <div class="input-group">
                <label class="input-label" for="searchQuery">
                    <i class="fas fa-search"></i>
                    Cari Aplikasi
                </label>
                <input type="text" id="searchQuery" class="input-field" placeholder="contoh: free fire" required>
            </div>
            <button class="submit-btn">
                <i class="fas fa-search"></i>
                Cari APK
            </button>
        `;
    }

    // Main request processing
    async processRequest() {
        if (this.isProcessing) return;

        this.isProcessing = true;
        this.showLoading(true, 'Memproses permintaan...');

        try {
            let result;

            switch(this.currentCategory) {
                case 'downloader':
                    result = await this.processDownloader();
                    break;
                case 'games':
                    result = await this.processGames();
                    break;
                case 'tools':
                    result = await this.processTools();
                    break;
                case 'apk':
                    result = await this.processApk();
                    break;
                default:
                    throw new Error('Kategori tidak valid');
            }

            this.displayResult(result);
            this.showToast('Permintaan berhasil!', 'success');
        } catch (error) {
            console.error('Process error:', error);
            this.showToast(error.message || 'Terjadi kesalahan', 'error');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
            document.getElementById('inputSection').classList.add('hidden');
        }
    }

    // Process downloader requests
    async processDownloader() {
        const url = document.getElementById('urlInput').value.trim();

        if (!url) {
            throw new Error('Harap masukkan URL media');
        }

        if (!this.isValidUrl(url)) {
            throw new Error('URL tidak valid');
        }

        return await this.fetchFromAPI('downloader', this.currentService, { url });
    }

    // Process games requests
    async processGames() {
        if (this.currentService === 'cc-sd') {
            const mataPelajaran = document.getElementById('mataPelajaran').value;
            const jumlahSoal = document.getElementById('jumlahSoal').value;

            if (!mataPelajaran) {
                throw new Error('Harap pilih mata pelajaran');
            }

            return await this.fetchFromAPI('games', this.currentService, {
                matapelajaran: mataPelajaran,
                jumlahsoal: jumlahSoal
            });
        }

        return await this.fetchFromAPI('games', this.currentService);
    }

    // Process tools requests
    async processTools() {
        if (this.currentService === 'npm') {
            const packageName = document.getElementById('packageName').value.trim();

            if (!packageName) {
                throw new Error('Harap masukkan nama package');
            }

            return await this.fetchFromAPI('tools', this.currentService, {
                packageName: packageName
            });
        }

        if (this.currentService === 'resi') {
            const resiNumber = document.getElementById('resiNumber').value.trim();
            const courier = document.getElementById('courier').value;

            if (!resiNumber || !courier) {
                throw new Error('Harap lengkapi data resi dan kurir');
            }

            return await this.fetchFromAPI('tools', this.currentService, {
                resi: resiNumber,
                courier: courier
            });
        }

        throw new Error('Tool tidak dikenali');
    }

    // Process APK search requests
    async processApk() {
        const searchQuery = document.getElementById('searchQuery').value.trim();

        if (!searchQuery) {
            throw new Error('Harap masukkan kata kunci pencarian');
        }

        return await this.fetchFromAPI('apk', this.currentService, {
            search: searchQuery
        });
    }

    // API communication
    async fetchFromAPI(category, service, params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const url = `/api/proxy/${category}/${service}${queryParams ? `?${queryParams}` : ''}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            const data = await response.json();

            if (!data.status && data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Silakan coba lagi.');
            }
            throw error;
        }
    }

    // Result display
    displayResult(data) {
        const resultSection = document.getElementById('resultSection');
        const resultTitle = document.getElementById('resultTitle');
        const resultContent = document.getElementById('resultContent');

        resultTitle.textContent = `Hasil - ${this.getServiceName(this.currentService)}`;
        resultContent.innerHTML = this.formatResult(data, this.currentCategory, this.currentService);

        resultSection.classList.remove('hidden');
        resultSection.scrollIntoView({ behavior: 'smooth' });

        // Add copy functionality and other interactions
        this.initializeResultInteractions();
    }

    // Format result based on category and service
    formatResult(data, category, service) {
        if (!data.status) {
            return `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h5>Error Processing Request</h5>
                    <p>${data.error || 'Unknown error occurred'}</p>
                </div>
            `;
        }

        let html = `
            <div class="success-header">
                <i class="fas fa-check-circle"></i>
                <h5>Request Successful!</h5>
                <p>Service: ${this.getServiceName(service)}</p>
            </div>
        `;

        // Category-specific formatting
        switch(category) {
            case 'downloader':
                html += this.formatDownloaderResult(data, service);
                break;
            case 'games':
                html += this.formatGamesResult(data, service);
                break;
            case 'tools':
                html += this.formatToolsResult(data, service);
                break;
            case 'apk':
                html += this.formatApkResult(data, service);
                break;
            default:
                html += this.formatGenericResult(data);
        }

        return html;
    }

    formatDownloaderResult(data, service) {
        let html = '';

        // Common downloader result structure
        if (data.data) {
            // TikTok, Instagram, etc.
            if (data.data.urls || data.data.downloads) {
                const urls = data.data.urls || data.data.downloads;
                if (urls && urls.length > 0) {
                    html += `<div class="download-links">`;
                    html += `<h6>Available Downloads:</h6>`;

                    urls.forEach((item, index) => {
                        const url = item.url || item;
                        const quality = item.quality || `Quality ${index + 1}`;

                        html += `
                            <div class="result-item">
                                <div class="result-title">${quality}</div>
                                <div class="result-url">
                                    <a href="${url}" target="_blank" class="download-link" download>
                                        <i class="fas fa-download"></i>
                                        Download
                                    </a>
                                    <button class="copy-btn" data-url="${url}">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    });

                    html += `</div>`;
                }
            }

            // Media with thumbnails
            if (data.data.thumbnail || (Array.isArray(data.data) && data.data[0]?.thumbnail)) {
                const thumbnails = Array.isArray(data.data) ? data.data : [data.data];

                html += `<div class="media-grid">`;
                thumbnails.forEach((item, index) => {
                    if (item.thumbnail) {
                        html += `
                            <div class="media-preview">
                                <img src="${item.thumbnail}" alt="Preview ${index + 1}" loading="lazy">
                                ${item.url ? `
                                    <div class="result-url">
                                        <a href="${item.url}" target="_blank" class="download-link" download>
                                            <i class="fas fa-download"></i>
                                            Download Media ${index + 1}
                                        </a>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }
                });
                html += `</div>`;
            }

            // Metadata information
            if (data.data.metadata) {
                const meta = data.data.metadata;
                html += `
                    <div class="result-meta">
                        <div class="result-item">
                            <strong>Title:</strong> ${meta.title || 'No title'}<br>
                            <strong>Creator:</strong> ${meta.creator || 'Unknown'}<br>
                            ${meta.description ? `<strong>Description:</strong> ${meta.description}<br>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        return html || this.formatGenericResult(data);
    }

    formatGamesResult(data, service) {
        let html = '';

        if (data.data) {
            // Question-Answer games
            if (data.data.soal && data.data.jawaban) {
                html += `
                    <div class="game-question">
                        <div class="result-item">
                            <h6>Pertanyaan:</h6>
                            <p>${data.data.soal}</p>
                        </div>
                        <div class="result-item">
                            <h6>Jawaban:</h6>
                            <p><strong>${data.data.jawaban}</strong></p>
                            ${data.data.deskripsi ? `<p><em>${data.data.deskripsi}</em></p>` : ''}
                        </div>
                    </div>
                `;
            }

            // Family 100 style
            if (Array.isArray(data.data.jawaban)) {
                html += `
                    <div class="game-answers">
                        <h6>Jawaban:</h6>
                        <div class="answers-grid">
                            ${data.data.jawaban.map((answer, index) => `
                                <div class="answer-item">${index + 1}. ${answer}</div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }

            // Cerdas Cermat with multiple questions
            if (Array.isArray(data.data)) {
                html += `<div class="quiz-questions">`;
                data.data.forEach((question, index) => {
                    html += `
                        <div class="result-item">
                            <h6>Soal ${index + 1}:</h6>
                            <p>${question.soal}</p>
                            <div class="options">
                                ${question.option ? Object.entries(question.option).map(([key, value]) => `
                                    <div class="option">${key}. ${value}</div>
                                `).join('') : ''}
                            </div>
                            <p><strong>Jawaban: ${question.jawaban}</strong></p>
                        </div>
                    `;
                });
                html += `</div>`;
            }

            // Media games (images, audio)
            if (data.data.img || data.data.audio) {
                if (data.data.img) {
                    html += `
                        <div class="media-preview">
                            <img src="${data.data.img}" alt="Game image" loading="lazy">
                        </div>
                    `;
                }

                if (data.data.audio) {
                    html += `
                        <div class="audio-preview">
                            <audio controls class="audio-player">
                                <source src="${data.data.audio}" type="audio/mpeg">
                                Browser Anda tidak mendukung pemutar audio.
                            </audio>
                        </div>
                    `;
                }
            }
        }

        return html || this.formatGenericResult(data);
    }

    formatToolsResult(data, service) {
        let html = '';

        if (data.data) {
            // NPM package info
            if (service === 'npm') {
                html += `
                    <div class="package-info">
                        <div class="result-item">
                            <h6>Package: ${data.data.name}</h6>
                            <p><strong>Latest Version:</strong> ${data.data.versionLatest}</p>
                            <p><strong>First Version:</strong> ${data.data.versionPublish}</p>
                            <p><strong>Total Updates:</strong> ${data.data.versionUpdate}</p>
                            <p><strong>Latest Dependencies:</strong> ${data.data.latestDependencies}</p>
                            <p><strong>First Published:</strong> ${new Date(data.data.publishTime).toLocaleDateString('id-ID')}</p>
                            <p><strong>Last Updated:</strong> ${new Date(data.data.latestPublishTime).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                `;
            }

            // Resi tracking
            if (service === 'resi') {
                html += `
                    <div class="tracking-info">
                        <div class="result-item">
                            <h6>Tracking Info</h6>
                            <p><strong>Kurir:</strong> ${data.data.courier}</p>
                            <p><strong>Resi:</strong> ${data.data.resi}</p>
                            <p><strong>Status:</strong> ${data.data.status}</p>
                            <p><strong>Pesan:</strong> ${data.data.message}</p>
                        </div>
                        ${data.data.history && data.data.history.length > 0 ? `
                            <div class="tracking-history">
                                <h6>Riwayat Pengiriman:</h6>
                                ${data.data.history.map(item => `
                                    <div class="history-item">
                                        <strong>${item.date || ''}</strong><br>
                                        ${item.desc || ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
        }

        return html || this.formatGenericResult(data);
    }

    formatApkResult(data, service) {
        let html = '';

        if (data.data && Array.isArray(data.data)) {
            html += `<div class="apk-results">`;
            data.data.forEach((app, index) => {
                html += `
                    <div class="result-item">
                        <div class="app-header">
                            ${app.icon ? `<img src="${app.icon}" alt="${app.title}" class="app-icon">` : ''}
                            <div class="app-info">
                                <h6>${app.title}</h6>
                                ${app.developer ? `<p><strong>Developer:</strong> ${app.developer}</p>` : ''}
                                ${app.version ? `<p><strong>Version:</strong> ${app.version}</p>` : ''}
                                ${app.genre ? `<p><strong>Genre:</strong> ${app.genre}</p>` : ''}
                                ${app.rating ? `<p><strong>Rating:</strong> ${app.rating.score || app.rating.stars}/10</p>` : ''}
                            </div>
                        </div>
                        ${app.features ? `<p><strong>Features:</strong> ${app.features}</p>` : ''}
                        ${app.link ? `
                            <div class="app-actions">
                                <a href="${app.link}" target="_blank" class="download-link">
                                    <i class="fas fa-external-link-alt"></i>
                                    View Details
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            html += `</div>`;
        }

        return html || this.formatGenericResult(data);
    }

    formatGenericResult(data) {
        return `
            <div class="generic-result">
                <pre class="json-output">${JSON.stringify(data.data || data, null, 2)}</pre>
            </div>
        `;
    }

    // File uploader functionality
    initializeUploader() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const uploadProgress = document.getElementById('uploadProgress');
        const uploadResult = document.getElementById('uploadResult');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultUrl = document.getElementById('resultUrl');
        const copyUrlBtn = document.getElementById('copyUrlBtn');
        const openUrlBtn = document.getElementById('openUrlBtn');

        // Click to upload
        uploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
            uploadArea.style.background = 'var(--surface)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = 'transparent';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border)';
            uploadArea.style.background = 'transparent';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Copy URL button
        copyUrlBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(resultUrl.value);
                this.showToast('URL copied to clipboard!', 'success');

                const icon = copyUrlBtn.querySelector('i');
                icon.className = 'fas fa-check';
                setTimeout(() => {
                    icon.className = 'fas fa-copy';
                }, 2000);
            } catch (error) {
                this.showToast('Failed to copy URL', 'error');
            }
        });
    }

    async handleFileUpload(file) {
        if (file.size > 100 * 1024 * 1024) {
            this.showToast('File size exceeds 100MB limit', 'error');
            return;
        }

        const uploadProgress = document.getElementById('uploadProgress');
        const uploadResult = document.getElementById('uploadResult');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultUrl = document.getElementById('resultUrl');
        const openUrlBtn = document.getElementById('openUrlBtn');

        // Show progress
        uploadProgress.classList.remove('hidden');
        uploadResult.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressFill.style.width = percentComplete + '%';
                    progressText.textContent = Math.round(percentComplete) + '%';
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const result = JSON.parse(xhr.responseText);

                    if (result.success) {
                        resultUrl.value = result.url;
                        openUrlBtn.href = result.url;

                        uploadProgress.classList.add('hidden');
                        uploadResult.classList.remove('hidden');

                        this.showToast('File uploaded successfully!', 'success');
                    } else {
                        throw new Error(result.error || 'Upload failed');
                    }
                } else {
                    throw new Error('Upload failed with status: ' + xhr.status);
                }
            });

            xhr.addEventListener('error', () => {
                throw new Error('Upload failed');
            });

            xhr.open('POST', '/api/uploader/ryzencdn');
            xhr.send(formData);

        } catch (error) {
            console.error('Upload error:', error);
            this.showToast(error.message || 'Upload failed', 'error');
            uploadProgress.classList.add('hidden');
        }
    }

    // Utility methods
    getServiceName(service) {
        const serviceNames = {
            // Downloader
            'tiktok': 'TikTok Downloader',
            'igdl': 'Instagram Downloader',
            'facebook': 'Facebook Downloader',
            'capcut': 'CapCut Downloader',
            'capcutv2': 'CapCut HD Downloader',
            'douyin': 'Douyin Downloader',
            'pinterest': 'Pinterest Downloader',
            'musicapple': 'Apple Music Downloader',
            'gdrive': 'Google Drive Downloader',
            'github': 'GitHub Downloader',
            'lahelu': 'Lahelu Downloader',
            'mediafire': 'MediaFire Downloader',

            // Games
            'asahotak': 'Asah Otak',
            'caklontong': 'Cak Lontong',
            'family100': 'Family 100',
            'cc-sd': 'Cerdas Cermat',
            'kabupaten': 'Tebak Kabupaten',
            'karakter-freefire': 'Tebak Karakter FreeFire',
            'siapakahaku': 'Siapakah Aku',
            'surah': 'Tebak Surah',
            'susunkata': 'Susun Kata',
            'tebakbendera': 'Tebak Bendera',
            'tebakgambar': 'Tebak Gambar',
            'tebakgame': 'Tebak Game',
            'tebakheroml': 'Tebak Hero ML',
            'tebakjkt': 'Tebak JKT48',
            'tebaklagu': 'Tebak Lagu',
            'tebaklirik': 'Tebak Lirik',
            'tebaklogo': 'Tebak Logo',

            // Tools
            'npm': 'NPM Package Check',
            'resi': 'Cek Resi',

            // APK
            'apkmody': 'APK Mody Search',
            'apkpure': 'APK Pure Search'
        };

        return serviceNames[service] || service;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showLoading(show, message = 'Memproses permintaan...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingTitle = document.getElementById('loadingTitle');
        const loadingMessage = document.getElementById('loadingMessage');

        if (show) {
            loadingTitle.textContent = 'Processing...';
            loadingMessage.textContent = message;
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');

        // Set content and type
        toastMessage.textContent = message;
        toast.className = `toast ${type} show`;

        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-exclamation-triangle';
        if (type === 'warning') iconClass = 'fas fa-exclamation-circle';

        toastIcon.className = `toast-icon ${iconClass}`;

        // Auto hide
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
        });
    }

    initializeResultInteractions() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const url = e.currentTarget.getAttribute('data-url');
                try {
                    await navigator.clipboard.writeText(url);
                    this.showToast('Link copied to clipboard!', 'success');

                    const icon = e.currentTarget.querySelector('i');
                    icon.className = 'fas fa-check';
                    setTimeout(() => {
                        icon.className = 'fas fa-copy';
                    }, 2000);
                } catch (error) {
                    this.showToast('Failed to copy link', 'error');
                }
            });
        });

        // Audio players
        document.querySelectorAll('audio').forEach(audio => {
            audio.addEventListener('play', () => {
                // Pause other audio players
                document.querySelectorAll('audio').forEach(otherAudio => {
                    if (otherAudio !== audio && !otherAudio.paused) {
                        otherAudio.pause();
                    }
                });
            });
        });
    }

    // Service Worker for PWA
    async initializeServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    // Smooth scrolling for anchor links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe elements for fade-in animation
        document.querySelectorAll('.tool-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    // Load available services
    async loadAvailableServices() {
        try {
            const response = await fetch('/api/services');
            const services = await response.json();
            console.log('Available services:', services);
        } catch (error) {
            console.log('Failed to load services:', error);
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.webTools = new CompleteWebTools();

    // Add ripple effect to buttons
    const addRippleEffect = (element) => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    };

    // Add ripple to buttons
    document.querySelectorAll('.submit-btn, .theme-btn, .nav-link, .tool-card').forEach(addRippleEffect);
});

// Add ripple effect styles
const rippleStyles = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
}

@keyframes ripple-animation {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

.submit-btn, .theme-btn, .nav-link, .tool-card {
    position: relative;
    overflow: hidden;
}

/* Additional responsive styles for mobile */
@media (max-width: 768px) {
    .app-header {
        padding: var(--space-3) 0;
    }

    .hero-section {
        padding: var(--space-12) 0;
    }

    .tools-section {
        padding: var(--space-12) 0;
    }

    .input-card,
    .result-card {
        margin: var(--space-4);
        width: calc(100% - var(--space-8));
    }
}

/* Dark mode improvements */
[data-theme="dark"] .input-field,
[data-theme="dark"] .result-url input {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text-primary);
}

[data-theme="dark"] .json-output {
    background: var(--surface);
    color: var(--text-primary);
}

/* Loading state improvements */
.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
}

/* Game specific styles */
.answers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-3);
    margin-top: var(--space-3);
}

.answer-item {
    background: var(--surface);
    padding: var(--space-3);
    border-radius: var(--radius);
    text-align: center;
    font-weight: 500;
}

.quiz-questions .result-item {
    margin-bottom: var(--space-6);
    border-left: 4px solid var(--primary);
    padding-left: var(--space-4);
}

.options {
    margin: var(--space-3) 0;
}

.option {
    padding: var(--space-2) var(--space-3);
    background: var(--surface);
    margin: var(--space-1) 0;
    border-radius: var(--radius);
}

/* APK search results */
.app-header {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
    margin-bottom: var(--space-3);
}

.app-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius);
    object-fit: cover;
}

.app-info {
    flex: 1;
}

.app-info h6 {
    margin-bottom: var(--space-2);
    font-size: var(--font-size-lg);
}

.app-actions {
    margin-top: var(--space-3);
}

/* Download links grid */
.download-links {
    display: grid;
    gap: var(--space-4);
}

.download-links .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
}

.download-links .result-url {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    margin: 0;
}

/* Media grid for multiple media */
.media-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin: var(--space-4) 0;
}

.media-preview {
    text-align: center;
}

.media-preview img {
    max-width: 100%;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

.audio-preview {
    margin: var(--space-4) 0;
    text-align: center;
}

/* Tracking history */
.tracking-history {
    margin-top: var(--space-4);
}

.history-item {
    background: var(--surface);
    padding: var(--space-3);
    margin: var(--space-2) 0;
    border-radius: var(--radius);
    border-left: 3px solid var(--primary);
}

/* Package info */
.package-info .result-item {
    background: linear-gradient(135deg, var(--surface), var(--card));
}

/* Error and success states */
.error-message {
    text-align: center;
    padding: var(--space-6);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--error);
    border-radius: var(--radius-lg);
    color: var(--error);
}

.success-header {
    text-align: center;
    padding: var(--space-6);
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--success);
    border-radius: var(--radius-lg);
    color: var(--success);
    margin-bottom: var(--space-6);
}

.success-header i {
    font-size: 3rem;
    margin-bottom: var(--space-4);
}

/* Utility classes */
.text-center { text-align: center; }
.mt-4 { margin-top: var(--space-4); }
.mb-4 { margin-bottom: var(--space-4); }
.p-4 { padding: var(--space-4); }

/* Print styles */
@media print {
    .app-header,
    .app-footer,
    .input-section,
    .theme-btn,
    .nav-link,
    .submit-btn,
    .copy-btn {
        display: none !important;
    }

    body {
        background: white !important;
        color: black !important;
    }

    .result-card {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
    }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = rippleStyles;
document.head.appendChild(styleSheet);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to close modals
    if (e.key === 'Escape') {
        document.getElementById('inputSection')?.classList.add('hidden');
        document.getElementById('resultSection')?.classList.add('hidden');
    }

    // Theme toggle with Ctrl/Cmd + T
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        window.webTools?.toggleTheme();
    }
});

// Add service worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}