import express from "express";

import {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    getSongStats,
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