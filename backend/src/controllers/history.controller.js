import History from "../models/History.js";

// ===========================
// ADD TO HISTORY
// ===========================
export const addHistory = async (req, res) => {
    try {
        const history = await History.create(req.body);

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
// GET HISTORY
// ===========================
export const getHistory = async (req, res) => {
    try {
        const {
            userId,
            page = 1,
            limit = 10,
        } = req.query;

        const query = {};

        if (userId) {
            query.userId = userId;
        }

        const total = await History.countDocuments(query);

        const history = await History.find(query)
            .populate("songId")
            .populate("userId", "fullName username")
            .sort({ playedAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        return res.json({
            success: true,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
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
        const history = await History.findById(req.params.id)
            .populate("songId")
            .populate("userId", "fullName username");

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
        const history = await History.findByIdAndDelete(req.params.id);

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
// CLEAR USER HISTORY
// ===========================
export const clearHistory = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }

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