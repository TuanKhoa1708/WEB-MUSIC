import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = express.Router();

// ─── Cloudinary config ───────────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer - use memory storage, then upload stream to Cloudinary ───────────
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// ─── Helper: upload buffer to Cloudinary ────────────────────────────────────
function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        Readable.from(buffer).pipe(uploadStream);
    });
}

// ─── Route: POST /api/upload ─────────────────────────────────────────────────
router.post('/', upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
]), async (req, res) => {
    try {
        const files = req.files;

        if (!files || (Object.keys(files).length === 0)) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }

        const result = {};

        // Upload audio to Cloudinary
        if (files.audio && files.audio.length > 0) {
            const audioFile = files.audio[0];
            const uploaded = await uploadToCloudinary(audioFile.buffer, {
                folder: 'pulse-music/audio',
                resource_type: 'video', // Cloudinary uses 'video' for audio
                public_id: `audio_${Date.now()}`,
            });
            result.audioUrl = uploaded.secure_url;
        }

        // Upload cover to Cloudinary
        if (files.cover && files.cover.length > 0) {
            const coverFile = files.cover[0];
            const uploaded = await uploadToCloudinary(coverFile.buffer, {
                folder: 'pulse-music/covers',
                resource_type: 'image',
                public_id: `cover_${Date.now()}`,
                transformation: [{ width: 500, height: 500, crop: 'fill', quality: 'auto' }],
            });
            result.coverUrl = uploaded.secure_url;
        }

        return res.json({ success: true, data: result });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ success: false, message: 'File upload failed: ' + error.message });
    }
});

export default router;
