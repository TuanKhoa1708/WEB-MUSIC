import express from "express";

import {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getPlaylistStats,
} from "../controllers/playlist.controller.js";

const router = express.Router();

// Statistics
router.get("/stats", getPlaylistStats);

// CRUD
router.post("/", createPlaylist);

router.get("/", getPlaylists);

router.get("/:id", getPlaylistById);

router.put("/:id", updatePlaylist);

router.delete("/:id", deletePlaylist);

export default router;