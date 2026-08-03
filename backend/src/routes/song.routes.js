import express from "express";

import {
    createSong,
    getSongs,
    getSongById,
    updateSong,
    deleteSong,
    getSongStats,
} from "../controllers/song.controller.js";

const router = express.Router();

// Statistics
router.get("/stats", getSongStats);

// CRUD
router.post("/", createSong);

router.get("/", getSongs);

router.get("/:id", getSongById);

router.put("/:id", updateSong);

router.delete("/:id", deleteSong);

export default router;