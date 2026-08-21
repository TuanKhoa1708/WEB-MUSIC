import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Route to handle multiple files (e.g. audio and cover)
router.post('/', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), (req, res) => {
  try {
    const files = req.files;
    if (!files) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const result = {};
    
    if (files.audio && files.audio.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      result.audioUrl = `${baseUrl}/uploads/${files.audio[0].filename}`;
    }
    
    if (files.cover && files.cover.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      result.coverUrl = `${baseUrl}/uploads/${files.cover[0].filename}`;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

export default router;
