import mongoose from "mongoose";
import History from "../models/History.js";
import Song from "../models/Song.js";

// ===========================
// ADD TO HISTORY
// ===========================
export const addHistory = async (req, res) => {
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
        // CREATE HISTORY
        // ===========================
        const history = await History.create({
            userId,
            songId,
            playedAt: new Date(),
        });

        // ===========================
        // UPDATE PLAY COUNT FOR AI & STATS
        // ===========================
        await Song.findByIdAndUpdate(songId, {
            $inc: { playCount: 1 }
        });

        return res.status(201).json({
            success: true,
            message: "Song added to history successfully",
            data: history,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET CURRENT USER HISTORY
// ===========================
export const getHistory = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
        } = req.query;

        // ===========================
        // VALIDATE PAGINATION
        // ===========================
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer",
            });
        }

        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be an integer between 1 and 100",
            });
        }

        // ===========================
        // GET CURRENT USER
        // ===========================
        const userId = req.user._id;

        const query = {
            userId,
        };

        const total = await History.countDocuments(query);

        const history = await History.find(query)
            .populate("songId")
            .sort({ playedAt: -1 })
            .skip(
                (pageNumber - 1) * limitNumber
            )
            .limit(limitNumber);

        return res.json({
            success: true,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(
                total / limitNumber
            ),
            data: history,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET HISTORY DETAIL
// ===========================
export const getHistoryById = async (req, res) => {
    try {
        const { id } = req.params;

        // ===========================
        // VALIDATE HISTORY ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid history ID",
            });
        }

        // ===========================
        // GET CURRENT USER
        // ===========================
        const userId = req.user._id;

        // ===========================
        // FIND HISTORY
        // ===========================
        const history = await History.findOne({
            _id: id,
            userId,
        })
            .populate("songId");

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "History not found",
            });
        }

        return res.json({
            success: true,
            data: history,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// DELETE HISTORY ITEM
// ===========================
export const deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // ===========================
        // VALIDATE HISTORY ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid history ID",
            });
        }

        // ===========================
        // GET CURRENT USER
        // ===========================
        const userId = req.user._id;

        // ===========================
        // DELETE OWN HISTORY
        // ===========================
        const history = await History.findOneAndDelete({
            _id: id,
            userId,
        });

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "History not found",
            });
        }

        return res.json({
            success: true,
            message: "History deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// CLEAR CURRENT USER HISTORY
// ===========================
export const clearHistory = async (req, res) => {
    try {
        // ===========================
        // GET CURRENT USER
        // ===========================
        const userId = req.user._id;

        // ===========================
        // DELETE ALL USER HISTORY
        // ===========================
        const result = await History.deleteMany({
            userId,
        });

        return res.json({
            success: true,
            message: "History cleared successfully",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};