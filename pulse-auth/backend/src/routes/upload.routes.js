import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// ─── Cloudinary Config ────────────────────────────────────────────────────────
// If Cloudinary credentials are set → use cloud storage (production)
// Otherwise → fall back to local disk storage (local dev)
const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let upload;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isAudio = file.mimetype.startsWith('audio/');
      return {
        folder: isAudio ? 'pulse/audio' : 'pulse/covers',
        resource_type: isAudio ? 'video' : 'image', // Cloudinary uses 'video' for audio files
        // Keep original extension
        format: path.extname(file.originalname).slice(1) || undefined,
        // Unique public_id
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      };
    },
  });

  upload = multer({ storage });
  console.log('☁️  Upload: using Cloudinary storage');
} else {
  // Local disk storage fallback
  const localDir = 'uploads/';
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, localDir),
    filename:    (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  upload = multer({ storage });
  console.log('💾  Upload: using local disk storage (set CLOUDINARY_* env vars for production)');
}

// ─── POST /api/upload ─────────────────────────────────────────────────────────
router.post('/', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]), (req, res) => {
  try {
    const files = req.files;
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const result = {};

    if (files.audio && files.audio.length > 0) {
      const f = files.audio[0];
      // Cloudinary gives us `path` as the secure URL; disk gives us `filename`
      result.audioUrl = (f.path && f.path.startsWith('http')) ? f.path : `${req.protocol}://${req.get('host')}/uploads/${f.filename}`;
    }

    if (files.cover && files.cover.length > 0) {
      const f = files.cover[0];
      result.coverUrl = (f.path && f.path.startsWith('http')) ? f.path : `${req.protocol}://${req.get('host')}/uploads/${f.filename}`;
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'File upload failed' });
  }
});

export default router;
