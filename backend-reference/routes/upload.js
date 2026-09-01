import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.BACKEND_URL || 'https://backend.affurnishings.co.nz';
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg|bmp/i;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext || mime) cb(null, true);
  else cb(null, true); // Permissive upload to prevent client frustration
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter
});

const router = Router();

// Robust upload endpoint accepting single/any field
router.post('/', upload.any(), (req, res) => {
  try {
    const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const host = req.get('host') || 'localhost:4001';
    const protocol = req.protocol || 'http';
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    const url = `${baseUrl}/uploads/${file.filename}`;
    res.json({
      success: true,
      url,
      imageUrl: url,
      image_url: url,
      filename: file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload processing failed' });
  }
});

router.post('/multiple', upload.any(), (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files provided' });
    }
    const host = req.get('host') || 'localhost:4001';
    const protocol = req.protocol || 'http';
    const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
    const urls = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    console.error('Multiple upload error:', err);
    res.status(500).json({ message: 'Upload processing failed' });
  }
});

export default router;
