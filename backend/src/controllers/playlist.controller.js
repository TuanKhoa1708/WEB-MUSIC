import mongoose from "mongoose";
import Playlist from "../models/Playlist.js";
import PlaylistSong from "../models/PlaylistSong.js";

// ===========================
// CREATE PLAYLIST
// ===========================
export const createPlaylist = async (req, res) => {
    try {
        const {
            title,
            description,
            artistId,
            coverUrl,
            isPublic,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Playlist title is required",
            });
        }

        if (!artistId) {
            return res.status(400).json({
                success: false,
                message: "Artist is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(artistId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid artist ID",
            });
        }

        const playlist = await Playlist.create({
            title: title.trim(),
            description: description?.trim() || "",
            artistId,
            coverUrl: coverUrl?.trim() || "",
            isPublic: isPublic ?? false,
        });

        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            data: playlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET ALL PLAYLISTS
// ===========================
export const getPlaylists = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            keyword = "",
            artistId,
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
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

        const query = {};

        // Search by playlist title
        if (keyword.trim()) {
            query.title = {
                $regex: keyword.trim(),
                $options: "i",
            };
        }

        // Filter playlists by Artist
        if (artistId) {
            if (!mongoose.Types.ObjectId.isValid(artistId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid artist ID",
                });
            }

            query.artistId = artistId;
        }

        const total = await Playlist.countDocuments(query);

        const playlists = await Playlist.find(query)
            .populate("artistId", "stageName avatarUrl")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: playlists,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET PLAYLISTS BY ARTIST
// ===========================
export const getPlaylistsByArtist = async (req, res) => {
    try {
        const { artistId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(artistId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid artist ID",
            });
        }

        const playlists = await Playlist.find({
            artistId,
        })
            .populate("artistId", "stageName avatarUrl")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: playlists,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET PLAYLIST DETAIL
// ===========================
export const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid playlist ID",
            });
        }

        const playlist = await Playlist.findById(id)
            .populate("artistId", "stageName avatarUrl");

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found",
            });
        }

        return res.json({
            success: true,
            data: playlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// UPDATE PLAYLIST
// ===========================
export const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid playlist ID",
            });
        }

        const {
            title,
            description,
            artistId,
            coverUrl,
            isPublic,
        } = req.body;

        const updateData = {};

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Playlist title cannot be empty",
                });
            }

            updateData.title = title.trim();
        }

        if (description !== undefined) {
            updateData.description = description.trim();
        }

        if (artistId !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(artistId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid artist ID",
                });
            }

            updateData.artistId = artistId;
        }

        if (coverUrl !== undefined) {
            updateData.coverUrl = coverUrl.trim();
        }

        if (isPublic !== undefined) {
            updateData.isPublic = isPublic;
        }

        const playlist = await Playlist.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).populate("artistId", "stageName avatarUrl");

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found",
            });
        }

        return res.json({
            success: true,
            message: "Playlist updated successfully",
            data: playlist,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// DELETE PLAYLIST
// ===========================
export const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid playlist ID",
            });
        }

        const playlist = await Playlist.findByIdAndDelete(id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found",
            });
        }

        // Delete associated playlist songs
        await PlaylistSong.deleteMany({ playlistId: id });

        return res.json({
            success: true,
            message: "Playlist deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// PLAYLIST STATS
// ===========================
export const getPlaylistStats = async (req, res) => {
    try {
        const totalPlaylists = await Playlist.countDocuments();

        return res.json({
            success: true,
            data: {
                totalPlaylists,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};