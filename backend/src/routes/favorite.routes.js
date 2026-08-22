import express from "express";

import {
    addFavorite,
    getFavorites,
    checkFavorite,
    removeFavorite,
} from "../controllers/favorite.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All favorite APIs require login
router.use(protect);

// Check if a song is favorited
router.get("/check", checkFavorite);

// Get current user's favorites
router.get("/", getFavorites);

// Add favorite
router.post("/", addFavorite);

// Remove favorite
router.delete("/:id", removeFavorite);

export default router;