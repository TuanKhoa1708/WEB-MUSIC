import express from "express";

import {
    createArtist,
    getArtists,
    getArtistById,
    updateArtist,
    deleteArtist,
    getArtistStats,
} from "../controllers/artist.controller.js";

const router = express.Router();

// Statistics
router.get("/stats", getArtistStats);

// CRUD
router.post("/", createArtist);

router.get("/", getArtists);

router.get("/:id", getArtistById);

router.put("/:id", updateArtist);

router.delete("/:id", deleteArtist);

export default router;