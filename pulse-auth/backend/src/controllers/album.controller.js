import mongoose from "mongoose";
import Album from "../models/Album.js";
import Artist from "../models/Artist.js";

// ===========================
// CREATE ALBUM
// ===========================
export const createAlbum = async (req, res) => {
    try {
        let currentArtistId = req.body.artistId;

        if (req.user.role === "artist") {
            const artist = await Artist.findOne({ userId: req.user._id });
            if (!artist) {
                return res.status(404).json({ success: false, message: "Artist profile not found" });
            }
            currentArtistId = artist._id;
        }

        const albumData = { ...req.body, artistId: currentArtistId };
        const album = await Album.create(albumData);

        return res.status(201).json({
            success: true,
            message: "Album created successfully",
            data: album,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid album data.",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                ),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// GET ALL ALBUMS
// ===========================
export const getAlbums = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            keyword = "",
        } = req.query;

        const pageNumber = Number(page);
        const pageSize = Number(limit);

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
            !Number.isInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Limit must be an integer between 1 and 100.",
            });
        }

        const query = {};

        if (keyword.trim()) {
            query.title = {
                $regex: keyword.trim(),
                $options: "i",
            };
        }

        const total = await Album.countDocuments(query);

        const albums = await Album.find(query)
            .populate("artistId", "stageName")
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: pageNumber,
            totalPages: Math.ceil(total / pageSize),
            data: albums,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// GET ALBUM DETAIL
// ===========================
export const getAlbumById = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid album ID.",
            });
        }

        const album = await Album.findById(req.params.id)
            .populate("artistId", "stageName")
            .populate("songs");

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found.",
            });
        }

        return res.json({
            success: true,
            data: album,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// UPDATE ALBUM
// ===========================
export const updateAlbum = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid album ID.",
            });
        }

        let updateData = { ...req.body };
        if (req.user.role === "artist") {
            const artist = await Artist.findOne({ userId: req.user._id });
            if (artist) {
                updateData.artistId = artist._id;
            }
        }

        const album = await Album.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found.",
            });
        }

        return res.json({
            success: true,
            message: "Album updated successfully.",
            data: album,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Invalid album data.",
                errors: Object.values(error.errors).map(
                    (err) => err.message
                ),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// DELETE ALBUM
// ===========================
export const deleteAlbum = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid album ID.",
            });
        }

        const album = await Album.findByIdAndDelete(req.params.id);

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found.",
            });
        }

        return res.json({
            success: true,
            message: "Album deleted successfully.",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// ===========================
// ALBUM STATS
// ===========================
export const getAlbumStats = async (req, res) => {
    try {
        const totalAlbums = await Album.countDocuments();

        return res.json({
            success: true,
            data: {
                totalAlbums,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};