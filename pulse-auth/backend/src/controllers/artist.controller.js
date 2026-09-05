import mongoose from "mongoose";
import Artist from "../models/Artist.js";
import User from "../models/User.js";
import Song from "../models/Song.js";
import Album from "../models/Album.js";

// ===========================
// CREATE ARTIST
// ===========================
export const createArtist = async (req, res) => {
    try {
        const {
            stageName,
            bio,
            avatarUrl,
            coverImage,
            socialLinks,
        } = req.body;

        // ===========================
        // VALIDATE STAGE NAME
        // ===========================
        if (!stageName || !stageName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Stage name is required.",
            });
        }

        // ===========================
        // CREATE ARTIST
        // ===========================
        const artist = await Artist.create({
            stageName: stageName.trim(),
            bio: bio?.trim() || "",
            avatarUrl: avatarUrl?.trim() || "",
            coverImage: coverImage?.trim() || "",
            socialLinks: socialLinks || {},
        });

        return res.status(201).json({
            success: true,
            message: "Artist created successfully.",
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

        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer.",
            });
        }

        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be an integer between 1 and 100.",
            });
        }

        const query = {};

        // ===========================
        // SEARCH BY STAGE NAME
        // ===========================
        if (keyword.trim()) {
            query.stageName = {
                $regex: keyword.trim(),
                $options: "i",
            };
        }

        const total = await Artist.countDocuments(query);

        const artists = await Artist.find(query)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

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
// GET ARTIST PROFILE
// ===========================
export const getArtistById = async (req, res) => {
    try {
        // ===========================
        // VALIDATE OBJECT ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid artist ID.",
            });
        }

        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found.",
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
// UPDATE ARTIST PROFILE
// ===========================
export const updateArtist = async (req, res) => {
    try {
        // ===========================
        // VALIDATE OBJECT ID
        // ===========================
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid artist ID.",
            });
        }

        const {
            stageName,
            bio,
            avatarUrl,
            coverImage,
            socialLinks,
        } = req.body;

        // ===========================
        // FIND ARTIST
        // ===========================
        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found.",
            });
        }

        // ===========================
        // VALIDATE STAGE NAME
        // ===========================
        if (stageName !== undefined) {
            if (!stageName.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Stage name cannot be empty.",
                });
            }

            artist.stageName = stageName.trim();
        }

        // ===========================
        // UPDATE PROFILE
        // ===========================
        if (bio !== undefined) {
            artist.bio = bio.trim();
        }

        if (avatarUrl !== undefined) {
            artist.avatarUrl = avatarUrl.trim();
        }

        if (coverImage !== undefined) {
            artist.coverImage = coverImage.trim();
        }

        if (socialLinks !== undefined) {
            artist.socialLinks = socialLinks;
        }

        // ===========================
        // SAVE
        // ===========================
        await artist.save();

        return res.json({
            success: true,
            message: "Artist profile updated successfully.",
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
// DELETE ARTIST (with cascade: songs + role reset)
// ===========================
export const deleteArtist = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid artist ID.",
            });
        }

        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found.",
            });
        }

        // 1. Delete all songs owned by this artist
        const deletedSongs = await Song.deleteMany({ artistId: artist._id });

        // 2. Reset the linked User's role back to 'user'
        if (artist.userId) {
            await User.findByIdAndUpdate(artist.userId, { role: "user" });
        }

        // 3. Delete the Artist record itself
        await Artist.findByIdAndDelete(req.params.id);

        return res.json({
            success: true,
            message: "Artist removed. Role reset to user and all songs deleted.",
            deletedSongsCount: deletedSongs.deletedCount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// ARTIST STATS
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
                totalFollowers:
                    totalFollowers[0]?.total || 0,
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
// ARTIST DASHBOARD STATISTICS
// ===========================
export const getArtistDashboardStats = async (req, res) => {
    try {
        // ===========================
        // FIND ARTIST BY LOGGED IN USER
        // ===========================
        const artist = await Artist.findOne({ userId: req.user._id });

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        // ===========================
        // COUNT ALBUMS
        // ===========================
        const totalAlbums = await Album.countDocuments({
            artistId: artist._id,
        });

        // ===========================
        // COUNT SONGS + TOTAL PLAYS
        // ===========================
        const songStats = await Song.aggregate([
            {
                $match: {
                    artistId: artist._id,
                },
            },
            {
                $group: {
                    _id: null,
                    totalSongs: {
                        $sum: 1,
                    },
                    totalPlays: {
                        $sum: "$playCount",
                    },
                },
            },
        ]);

        const totalSongs = songStats[0]?.totalSongs || 0;
        const totalPlays = songStats[0]?.totalPlays || 0;

        // ===========================
        // RESPONSE
        // ===========================
        return res.json({
            success: true,
            data: {
                artist: {
                    id: artist._id,
                    stageName: artist.stageName,
                    avatarUrl: artist.avatarUrl,
                    coverImage: artist.coverImage,
                },
                statistics: {
                    totalSongs,
                    totalAlbums,
                    totalFollowers: artist.followers || 0,
                    totalPlays,
                },
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
// ARTIST PREMIUM REVENUE & STATISTICS (AS-133 & AS-134)
// ===========================
export const getArtistRevenue = async (req, res) => {
    try {
        // ===========================
        // FIND ARTIST BY LOGGED IN USER
        // ===========================
        const artist = await Artist.findOne({ userId: req.user._id });

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        // Lấy tất cả bài hát của nghệ sĩ để tính tổng lượt nghe
        const songStats = await Song.aggregate([
            {
                $match: {
                    artistId: artist._id,
                },
            },
            {
                $group: {
                    _id: null,
                    totalPlays: { $sum: "$playCount" },
                    totalSongs: { $sum: 1 },
                },
            },
        ]);

        const totalPlays = songStats[0]?.totalPlays || 0;
        const totalSongs = songStats[0]?.totalSongs || 0;

        // Quy đổi doanh thu Premium: Ví dụ mỗi lượt nghe tương ứng với 0.05 đơn vị tiền tệ (có thể điều chỉnh)
        const RATE_PER_PLAY = 0.05;
        const estimatedRevenue = totalPlays * RATE_PER_PLAY;

        return res.json({
            success: true,
            data: {
                artistId: artist._id,
                stageName: artist.stageName,
                totalSongs,
                totalPlays,
                ratePerPlay: RATE_PER_PLAY,
                estimatedRevenue: Number(estimatedRevenue.toFixed(2)), // Làm tròn 2 chữ số thập phân
                currency: "USD",
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};