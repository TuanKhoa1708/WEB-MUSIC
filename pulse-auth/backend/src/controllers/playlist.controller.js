import Playlist from "../models/Playlist.js";

// ===========================
// CREATE PLAYLIST
// ===========================
export const createPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.create(req.body);

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
        } = req.query;

        const query = {};

        if (keyword) {
            query.title = {
                $regex: keyword,
                $options: "i",
            };
        }

        const total = await Playlist.countDocuments(query);

        const playlists = await Playlist.find(query)
            .populate("userId", "fullName username")
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
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
        const playlist = await Playlist.findById(req.params.id)
            .populate("userId", "fullName username");

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
        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

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
        const playlist = await Playlist.findByIdAndDelete(req.params.id);

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: "Playlist not found",
            });
        }

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