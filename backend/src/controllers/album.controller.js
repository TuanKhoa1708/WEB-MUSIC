import Album from "../models/Album.js";

// ===========================
// CREATE ALBUM
// ===========================
export const createAlbum = async (req, res) => {
    try {
        const album = await Album.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Album created successfully",
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
// GET ALL ALBUMS
// ===========================
export const getAlbums = async (req, res) => {
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

        const total = await Album.countDocuments(query);

        const albums = await Album.find(query)
            .populate("artistId", "stageName")
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
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
        const album = await Album.findById(req.params.id)
            .populate("artistId", "stageName");

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found",
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
        const album = await Album.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found",
            });
        }

        return res.json({
            success: true,
            message: "Album updated successfully",
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
// DELETE ALBUM
// ===========================
export const deleteAlbum = async (req, res) => {
    try {
        const album = await Album.findByIdAndDelete(req.params.id);

        if (!album) {
            return res.status(404).json({
                success: false,
                message: "Album not found",
            });
        }

        return res.json({
            success: true,
            message: "Album deleted successfully",
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