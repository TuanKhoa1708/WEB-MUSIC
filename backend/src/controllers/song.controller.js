import Song from "../models/Song.js";

// ===========================
// CREATE SONG
// ===========================
export const createSong = async (req, res) => {
    try {
        const song = await Song.create(req.body);

        res.status(201).json({
            success: true,
            message: "Song created successfully",
            data: song,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET ALL SONGS
// ===========================
export const getSongs = async (req, res) => {
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

        const total = await Song.countDocuments(query);

        const songs = await Song.find(query)
            .populate("artistId", "stageName")
            .populate("albumId", "title")
            .skip((page - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            data: songs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET SONG DETAIL
// ===========================
export const getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id)
            .populate("artistId")
            .populate("albumId");

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found",
            });
        }

        res.json({
            success: true,
            data: song,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// UPDATE SONG
// ===========================
export const updateSong = async (req, res) => {
    try {
        const song = await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found",
            });
        }

        res.json({
            success: true,
            message: "Song updated successfully",
            data: song,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// DELETE SONG
// ===========================
export const deleteSong = async (req, res) => {
    try {
        const song = await Song.findByIdAndDelete(req.params.id);

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found",
            });
        }

        res.json({
            success: true,
            message: "Song deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// SONG STATS
// ===========================
export const getSongStats = async (req, res) => {
    try {
        const totalSongs = await Song.countDocuments();

        res.json({
            success: true,
            data: {
                totalSongs,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};