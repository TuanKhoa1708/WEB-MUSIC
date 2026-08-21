import mongoose from "mongoose";
import User from "../models/User.js";

// ===========================
// GET ALL LISTENERS
// SEARCH + FILTER + PAGINATION
// ===========================
export const getListeners = async (req, res) => {
    try {
        const {
            keyword,
            isActive,
            isVerified,
            page = 1,
            limit = 10,
        } = req.query;

        // ===========================
        // VALIDATE FILTER
        // ===========================
        if (
            isActive !== undefined &&
            !["true", "false"].includes(isActive)
        ) {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false.",
            });
        }

        if (
            isVerified !== undefined &&
            !["true", "false"].includes(isVerified)
        ) {
            return res.status(400).json({
                success: false,
                message: "isVerified must be true or false.",
            });
        }

        // ===========================
        // VALIDATE PAGINATION
        // ===========================
        const pageNumber = Number(page);
        const pageSize = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer.",
            });
        }

        if (
            !Number.isInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be an integer between 1 and 100.",
            });
        }

        // ===========================
        // QUERY
        // ===========================
        const query = {
            role: "user",
        };

        // ===========================
        // SEARCH
        // ===========================
        if (keyword) {
            query.$or = [
                {
                    fullName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    username: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ];
        }

        // ===========================
        // FILTER ACTIVE
        // ===========================
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        // ===========================
        // FILTER VERIFIED
        // ===========================
        if (isVerified !== undefined) {
            query.isVerified = isVerified === "true";
        }

        // ===========================
        // COUNT
        // ===========================
        const total = await User.countDocuments(query);

        // ===========================
        // GET LISTENERS
        // ===========================
        const listeners = await User.find(query)
            .select("-password")
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
            data: listeners,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// GET LISTENER DETAIL
// ===========================
export const getListenerById = async (req, res) => {
    try {
        // ===========================
        // VALIDATE OBJECT ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listener ID.",
            });
        }

        const listener = await User.findOne({
            _id: req.params.id,
            role: "user",
        }).select("-password");

        if (!listener) {
            return res.status(404).json({
                success: false,
                message: "Listener not found.",
            });
        }

        return res.json({
            success: true,
            data: listener,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// UPDATE LISTENER
// ===========================
export const updateListener = async (req, res) => {
    try {
        // ===========================
        // VALIDATE OBJECT ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listener ID.",
            });
        }

        const {
            fullName,
            username,
            email,
            avatarUrl,
            isVerified,
            isActive,
        } = req.body;

        // ===========================
        // FIND LISTENER
        // ===========================
        const listener = await User.findOne({
            _id: req.params.id,
            role: "user",
        });

        if (!listener) {
            return res.status(404).json({
                success: false,
                message: "Listener not found.",
            });
        }

        // ===========================
        // CHECK DUPLICATE USERNAME
        // ===========================
        if (username && username !== listener.username) {
            const usernameExists = await User.findOne({
                username,
                _id: { $ne: listener._id },
            });

            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: "Username already exists.",
                });
            }

            listener.username = username;
        }

        // ===========================
        // CHECK DUPLICATE EMAIL
        // ===========================
        if (email && email !== listener.email) {
            const emailExists = await User.findOne({
                email,
                _id: { $ne: listener._id },
            });

            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: "Email already exists.",
                });
            }

            listener.email = email;
        }

        // ===========================
        // UPDATE FIELDS
        // ===========================
        if (fullName !== undefined) {
            listener.fullName = fullName;
        }

        if (avatarUrl !== undefined) {
            listener.avatarUrl = avatarUrl;
        }

        if (isVerified !== undefined) {
            listener.isVerified = isVerified;
        }

        if (isActive !== undefined) {
            listener.isActive = isActive;
        }

        // ===========================
        // SAVE
        // ===========================
        await listener.save();

        return res.json({
            success: true,
            message: "Listener updated successfully.",
            data: {
                id: listener._id,
                fullName: listener.fullName,
                username: listener.username,
                email: listener.email,
                avatarUrl: listener.avatarUrl,
                role: listener.role,
                isVerified: listener.isVerified,
                isActive: listener.isActive,
                lastLogin: listener.lastLogin,
                createdAt: listener.createdAt,
                updatedAt: listener.updatedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// DELETE LISTENER
// ===========================
export const deleteListener = async (req, res) => {
    try {
        // ===========================
        // VALIDATE OBJECT ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid listener ID.",
            });
        }

        const listener = await User.findOneAndDelete({
            _id: req.params.id,
            role: "user",
        });

        if (!listener) {
            return res.status(404).json({
                success: false,
                message: "Listener not found.",
            });
        }

        return res.json({
            success: true,
            message: "Listener deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// LISTENER STATS
// ===========================
export const getListenerStats = async (req, res) => {
    try {
        const totalListeners = await User.countDocuments({
            role: "user",
        });

        const activeListeners = await User.countDocuments({
            role: "user",
            isActive: true,
        });

        const verifiedListeners = await User.countDocuments({
            role: "user",
            isVerified: true,
        });

        return res.json({
            success: true,
            data: {
                totalListeners,
                activeListeners,
                verifiedListeners,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};