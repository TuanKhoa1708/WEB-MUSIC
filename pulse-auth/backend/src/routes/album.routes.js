import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

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
router.post("/", protect, authorize("artist", "admin"), createAlbum);

router.get("/", getAlbums);

router.get("/:id", getAlbumById);

router.put("/:id", protect, authorize("artist", "admin"), updateAlbum);

router.delete("/:id", protect, authorize("artist", "admin"), deleteAlbum);

export default router;