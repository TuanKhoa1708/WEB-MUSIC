import express from "express";

import {
    createArtist,
    getArtists,
    getArtistById,
    updateArtist,
    deleteArtist,
    getArtistStats,
    getArtistDashboardStats,
} from "../controllers/artist.controller.js";
import { getPlaylistsByArtist } from "../controllers/playlist.controller.js";

const router = express.Router();

// ===========================
// STATISTICS
// ===========================

// Global artist statistics
router.get("/stats", getArtistStats);

// Artist dashboard statistics
router.get("/:id/dashboard-stats", getArtistDashboardStats);

// Playlists by artist
router.get("/:artistId/playlists", getPlaylistsByArtist);

// ===========================
// CRUD
// ===========================

router.post("/", createArtist);

router.get("/", getArtists);

router.get("/:id", getArtistById);

router.put("/:id", updateArtist);

router.delete("/:id", deleteArtist);

export default router;