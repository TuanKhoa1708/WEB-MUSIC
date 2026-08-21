import express from "express";

import {
    createAlbum,
    getAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    getAlbumStats,
} from "../controllers/album.controller.js";

const router = express.Router();

// Statistics
router.get("/stats", getAlbumStats);

// CRUD
router.post("/", createAlbum);

router.get("/", getAlbums);

router.get("/:id", getAlbumById);

router.put("/:id", updateAlbum);

router.delete("/:id", deleteAlbum);

export default router;