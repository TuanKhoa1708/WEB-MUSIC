import express from "express";

import {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    getSongStats,
    getRecommendations,
    skipSong, // <-- Đã thêm import
} from "../controllers/song.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Statistics
router.get(
    "/stats",
    protect,
    authorize("artist", "admin"),
    getSongStats
);

// ===========================
// AI RECOMMENDATIONS (AS-132)
// ===========================
router.get("/recommendations", protect, getRecommendations);

// ===========================
// FREE TIER LIMITS
// ===========================
router.post("/skip", protect, skipSong); // <-- Đã thêm route giới hạn skip

// CRUD
router.post(
    "/",
    protect,
    authorize("artist", "admin"),
    createSong
);

router.get("/", getSongs);

router.get("/:id", getSongById);

router.put(
    "/:id",
    protect,
    authorize("artist", "admin"),
    updateSong
);

router.delete(
    "/:id",
    protect,
    authorize("artist", "admin"),
    deleteSong
);

export default router;