import Artist from "../models/Artist.js";

// ===========================
// CREATE ARTIST
// ===========================
export const createArtist = async (req, res) => {
    try {
        const artist = await Artist.create(req.body);

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

        const query = {};

        if (keyword) {
            query.stageName = {
                $regex: keyword,
                $options: "i",
            };
        }

        const total = await Artist.countDocuments(query);

        const artists = await Artist.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({
                createdAt: -1,
            });

        res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / limit),
            data: artists,
        });
    } catch (error) {
        res.status(500).json({
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
        const artist = await Artist.findById(req.params.id);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        res.json({
            success: true,
            data: artist,
        });
    } catch (error) {
        res.status(500).json({
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
        const artist = await Artist.findByIdAndUpdate(
            req.params.id,
            req.body,
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

        res.json({
            success: true,
            message: "Artist updated",
            data: artist,
        });
    } catch (error) {
        res.status(500).json({
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

        res.json({
            success: true,
            message: "Artist deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
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

        res.json({
            success: true,
            data: {
                totalArtists,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};