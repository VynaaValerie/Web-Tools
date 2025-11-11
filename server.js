import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "https://api.siputzx.my.id", "https://fonts.googleapis.com", "https://api.ryzumi.vip"],
      frameSrc: ["'self'"],
      mediaSrc: ["'self'", "https:", "http:"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public/assets'), {
  maxAge: '1y',
  immutable: true
}));

app.use(express.static('public', {
  maxAge: '1h',
  etag: false
}));

// Multer untuk file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '3.0.0',
    features: ['downloader', 'games', 'tools', 'apk', 'uploader']
  });
});

// Enhanced Proxy untuk semua endpoint
const API_BASE = 'https://api.siputzx.my.id';

// Kategori Downloader Media
const downloaderServices = {
  'capcut': 'CapCut',
  'capcutv2': 'CapCut HD',
  'douyin': 'Douyin',
  'facebook': 'Facebook',
  'gdrive': 'Google Drive',
  'github': 'GitHub',
  'igdl': 'Instagram',
  'lahelu': 'Lahelu',
  'mediafire': 'MediaFire',
  'musicapple': 'Apple Music',
  'pinterest': 'Pinterest',
  'tiktok': 'TikTok'
};

// Kategori Games
const gameServices = {
  'asahotak': 'Asah Otak',
  'caklontong': 'Cak Lontong',
  'family100': 'Family 100',
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
  'tebaklogo': 'Tebak Logo'
};

// Kategori Tools
const toolServices = {
  'npm': 'NPM Package Check',
  'resi': 'Resi Check'
};

// Kategori APK
const apkServices = {
  'apkmody': 'APK Mody',
  'apkpure': 'APK Pure'
};

// Proxy untuk Downloader Media
app.get('/api/proxy/downloader/:service', async (req, res) => {
  await handleProxyRequest(req, res, 'downloader', downloaderServices);
});

// Proxy untuk Games
app.get('/api/proxy/games/:service', async (req, res) => {
  await handleProxyRequest(req, res, 'games', gameServices);
});

// Proxy untuk Tools
app.get('/api/proxy/tools/:service', async (req, res) => {
  await handleProxyRequest(req, res, 'tools', toolServices);
});

// Proxy untuk APK
app.get('/api/proxy/apk/:service', async (req, res) => {
  await handleProxyRequest(req, res, 'apk', apkServices);
});

// Handler untuk semua proxy requests
async function handleProxyRequest(req, res, category, services) {
  const { service } = req.params;
  const queryParams = new URLSearchParams(req.query).toString();

  if (!services[service]) {
    return res.status(400).json({ 
      error: 'Invalid service',
      code: 'INVALID_SERVICE',
      available: Object.keys(services)
    });
  }

  try {
    let targetUrl;

    if (category === 'downloader') {
      targetUrl = `${API_BASE}/api/d/${service}?${queryParams}`;
    } else if (category === 'games') {
      targetUrl = `${API_BASE}/api/games/${service}?${queryParams}`;
    } else if (category === 'tools') {
      targetUrl = `${API_BASE}/api/check/${service}?${queryParams}`;
    } else if (category === 'apk') {
      targetUrl = `${API_BASE}/api/apk/${service}?${queryParams}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/json, */*',
        'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
        'Referer': 'https://api.siputzx.my.id/'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ ${services[service]} - Success`);

    res.json({
      ...data,
      _meta: {
        service: services[service],
        category: category,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(`❌ ${services[service]} - Error:`, error.message);

    if (error.name === 'AbortError') {
      res.status(408).json({ 
        error: 'Request timeout',
        code: 'TIMEOUT'
      });
    } else {
      res.status(500).json({ 
        error: 'Service temporarily unavailable',
        code: 'SERVICE_ERROR',
        details: error.message
      });
    }
  }
}

// Endpoint khusus untuk Cerdas Cermat (memerlukan parameter khusus)
app.get('/api/proxy/games/cc-sd', async (req, res) => {
  const { matapelajaran, jumlahsoal } = req.query;

  if (!matapelajaran) {
    return res.status(400).json({
      error: 'Parameter matapelajaran diperlukan',
      code: 'MISSING_PARAMETER'
    });
  }

  try {
    const targetUrl = `${API_BASE}/api/games/cc-sd?matapelajaran=${matapelajaran}&jumlahsoal=${jumlahsoal || 5}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, */*'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('❌ Cerdas Cermat - Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch cerdas cermat questions',
      code: 'SERVICE_ERROR'
    });
  }
});

// Uploader endpoint untuk RyzenCDN
app.post('/api/uploader/ryzencdn', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await fetch('https://api.ryzumi.vip/api/uploader/ryzencdn', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();

    res.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      size: req.file.size,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Upload Error:', error.message);
    res.status(500).json({
      error: 'Upload failed',
      code: 'UPLOAD_ERROR',
      details: error.message
    });
  }
});

// Get semua services yang tersedia
app.get('/api/services', (req, res) => {
  res.json({
    downloader: downloaderServices,
    games: gameServices,
    tools: toolServices,
    apk: apkServices,
    uploader: ['ryzencdn']
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('🚨 Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
🚀 xwby268 Complete Tools v3.0.0
📍 Server running on port ${PORT}
📱 Visit: http://localhost:${PORT}
✨ Features: 
   - Downloader Media (${Object.keys(downloaderServices).length} services)
   - Games (${Object.keys(gameServices).length} games)
   - Tools (${Object.keys(toolServices).length} tools)
   - APK Search (${Object.keys(apkServices).length} sources)
   - File Uploader
  `);
});

export default app;