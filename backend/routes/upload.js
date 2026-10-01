import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import { compressImage } from '../utils/imageProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|svg/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files (jpg, png, gif, webp, svg) are allowed'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
}).single('image');

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message, '| File:', err.file?.originalname, '| Mimetype:', err.file?.mimetype);
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      console.error('Upload error: No file received by multer');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    next();
  });
};

const router = Router();

router.post('/', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    await compressImage(filePath);
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.post('/multiple', authenticateToken, multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter }).array('images', 10), async (req, res) => {
  try {
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    await Promise.all(req.files.map(f => compressImage(path.join(__dirname, '../uploads', f.filename))));
    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (err) {
    console.error('Multiple upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Alias: /api/upload/image (same as POST /api/upload)
router.post('/image', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    await compressImage(filePath);
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Alias: /api/upload/single (same as POST /api/upload)
router.post('/single', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    await compressImage(filePath);
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
