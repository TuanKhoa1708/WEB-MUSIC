import express from "express";

import {
    addFavorite,
    getFavorites,
    checkFavorite,
    removeFavorite,
} from "../controllers/favorite.controller.js";

const router = express.Router();

// Check if a song is favorited
router.get("/check", checkFavorite);

// Get favorites
router.get("/", getFavorites);

// Add favorite
router.post("/", addFavorite);

// Remove favorite
router.delete("/:id", removeFavorite);

export default router;