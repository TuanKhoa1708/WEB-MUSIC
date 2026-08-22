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

const router = express.Router();

// ===========================
// STATISTICS
// ===========================

router.get("/stats", getArtistStats);

router.get(
    "/:id/dashboard-stats",
    getArtistDashboardStats
);

// ===========================
// CRUD
// ===========================

router.post("/", createArtist);

router.get("/", getArtists);

router.get("/:id", getArtistById);

router.put("/:id", updateArtist);

router.delete("/:id", deleteArtist);

export default router;