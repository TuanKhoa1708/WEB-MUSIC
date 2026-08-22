import mongoose from "mongoose";
import Favorite from "../models/Favorite.js";

// ===========================
// ADD FAVORITE
// ===========================
export const addFavorite = async (req, res) => {
    try {
        const { songId } = req.body;

        // ===========================
        // VALIDATE SONG ID
        // ===========================
        if (
            !songId ||
            !mongoose.Types.ObjectId.isValid(songId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid song ID is required",
            });
        }

        // ===========================
        // GET CURRENT USER
        // ===========================
        const userId = req.user._id;

        // ===========================
        // CREATE FAVORITE
        // ===========================
        const favorite = await Favorite.create({
            userId,
            songId,
        });

        return res.status(201).json({
            success: true,
            message: "Song added to favorites successfully",
            data: favorite,
        });
    } catch (error) {
        // Duplicate favorite
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Song is already in favorites",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET CURRENT USER FAVORITES
// ===========================
export const getFavorites = async (req, res) => {
    try {
        const userId = req.user._id;

        const favorites = await Favorite.find({
            userId,
        })
            .populate("songId")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: favorites,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// CHECK FAVORITE
// ===========================
export const checkFavorite = async (req, res) => {
    try {
        const { songId } = req.query;

        // ===========================
        // VALIDATE SONG ID
        // ===========================
        if (
            !songId ||
            !mongoose.Types.ObjectId.isValid(songId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid song ID is required",
            });
        }

        const userId = req.user._id;

        const favorite = await Favorite.findOne({
            userId,
            songId,
        });

        return res.json({
            success: true,
            isFavorite: !!favorite,
            data: favorite || null,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// REMOVE FAVORITE
// ===========================
export const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        // ===========================
        // VALIDATE FAVORITE ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid favorite ID",
            });
        }

        const userId = req.user._id;

        // ===========================
        // DELETE CURRENT USER FAVORITE
        // ===========================
        const favorite = await Favorite.findOneAndDelete({
            _id: id,
            userId,
        });

        if (!favorite) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found",
            });
        }

        return res.json({
            success: true,
            message: "Song removed from favorites successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};