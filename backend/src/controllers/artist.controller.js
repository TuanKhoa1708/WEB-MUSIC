import Artist from "../models/Artist.js";
import User from "../models/User.js";

// ===========================
// CREATE ARTIST
// ===========================
export const createArtist = async (req, res) => {
    try {
        const {
            userId,
            stageName,
            bio,
            avatarUrl,
            coverImage,
            followers,
            socialLinks,
        } = req.body;

        if (!userId || !stageName) {
            return res.status(400).json({
                success: false,
                message: "userId and stageName are required",
            });
        }

        // Kiểm tra User tồn tại
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Kiểm tra user đã có Artist profile chưa
        const existingArtist = await Artist.findOne({ userId });

        if (existingArtist) {
            return res.status(409).json({
                success: false,
                message: "This user already has an artist profile",
            });
        }

        const artist = await Artist.create({
            userId,
            stageName,
            bio: bio || "",
            avatarUrl: avatarUrl || "",
            coverImage: coverImage || "",
            followers: followers || 0,
            socialLinks: socialLinks || {},
        });

        return res.status(201).json({
            success: true,
            message: "Artist created successfully",
            data: artist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET ALL ARTISTS
// ===========================
export const getArtists = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            keyword = "",
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const query = {};

        if (keyword) {
            query.stageName = {
                $regex: keyword,
                $options: "i",
            };
        }

        const total = await Artist.countDocuments(query);

        const artists = await Artist.find(query)
            .populate("userId", "fullName username email avatarUrl")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({
                createdAt: -1,
            });

        return res.json({
            success: true,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: artists,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET ARTIST DETAIL
// ===========================
export const getArtistById = async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id)
            .populate(
                "userId",
                "fullName username email avatarUrl role"
            );

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        return res.json({
            success: true,
            data: artist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// UPDATE ARTIST
// ===========================
export const updateArtist = async (req, res) => {
    try {
        const {
            stageName,
            bio,
            avatarUrl,
            coverImage,
            socialLinks,
        } = req.body;

        const artist = await Artist.findByIdAndUpdate(
            req.params.id,
            {
                stageName,
                bio,
                avatarUrl,
                coverImage,
                socialLinks,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        return res.json({
            success: true,
            message: "Artist updated successfully",
            data: artist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// DELETE ARTIST
// ===========================
export const deleteArtist = async (req, res) => {
    try {
        const artist = await Artist.findByIdAndDelete(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        return res.json({
            success: true,
            message: "Artist deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// STATS
// ===========================
export const getArtistStats = async (req, res) => {
    try {
        const totalArtists = await Artist.countDocuments();

        const totalFollowers = await Artist.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$followers",
                    },
                },
            },
        ]);

        return res.json({
            success: true,
            data: {
                totalArtists,
                totalFollowers: totalFollowers[0]?.total || 0,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};