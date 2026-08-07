import Favorite from "../models/Favorite.js";

// ===========================
// ADD FAVORITE
// ===========================
export const addFavorite = async (req, res) => {
    try {
        const favorite = await Favorite.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Song added to favorites successfully",
            data: favorite,
        });
    } catch (error) {
        // User đã favorite bài này
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
// GET USER FAVORITES
// ===========================
export const getFavorites = async (req, res) => {
    try {
        const { userId } = req.query;

        const query = {};

        if (userId) {
            query.userId = userId;
        }

        const favorites = await Favorite.find(query)
            .populate("songId")
            .populate("userId", "fullName username")
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
        const { userId, songId } = req.query;

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
        const favorite = await Favorite.findByIdAndDelete(req.params.id);

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