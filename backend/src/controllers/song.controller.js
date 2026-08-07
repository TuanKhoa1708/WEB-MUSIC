import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Album from "../models/Album.js";

// CREATE SONG
export const createSong = async (req, res) => {
    try {
        const {
            title,
            artistId,
            albumId,
            audioUrl,
            coverUrl,
            duration,
            genre,
            lyrics,
        } = req.body;

        if (!title || !artistId || !audioUrl || duration === undefined) {
            return res.status(400).json({
                success: false,
                message: "title, artistId, audioUrl and duration are required",
            });
        }

        const artist = await Artist.findById(artistId);

        if (!artist) {
            return res.status(404).json({
                success: false,
                message: "Artist not found",
            });
        }

        if (albumId) {
            const album = await Album.findById(albumId);

            if (!album) {
                return res.status(404).json({
                    success: false,
                    message: "Album not found",
                });
            }
        }

        const song = await Song.create({
            title,
            artistId,
            albumId: albumId || null,
            audioUrl,
            coverUrl: coverUrl || "",
            duration,
            genre: genre || "",
            lyrics: lyrics || "",
        });

        const result = await Song.findById(song._id)
            .populate("artistId", "stageName")
            .populate("albumId", "title");

        return res.status(201).json({
            success: true,
            message: "Song created successfully",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET ALL SONGS
export const getSongs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            keyword = "",
            artistId,
            genre,
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const query = {};

        if (keyword) {
            query.title = {
                $regex: keyword,
                $options: "i",
            };
        }

        if (artistId) {
            query.artistId = artistId;
        }

        if (genre) {
            query.genre = {
                $regex: genre,
                $options: "i",
            };
        }

        const total = await Song.countDocuments(query);

        const songs = await Song.find(query)
            .populate("artistId", "stageName")
            .populate("albumId", "title")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: songs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET SONG DETAIL
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

        return res.json({
            success: true,
            data: song,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE SONG
export const updateSong = async (req, res) => {
    try {
        const song = await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        )
            .populate("artistId", "stageName")
            .populate("albumId", "title");

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found",
            });
        }

        return res.json({
            success: true,
            message: "Song updated successfully",
            data: song,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE SONG
export const deleteSong = async (req, res) => {
    try {
        const song = await Song.findByIdAndDelete(req.params.id);

        if (!song) {
            return res.status(404).json({
                success: false,
                message: "Song not found",
            });
        }

        return res.json({
            success: true,
            message: "Song deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// SONG STATS
export const getSongStats = async (req, res) => {
    try {
        const totalSongs = await Song.countDocuments();

        const totalPlays = await Song.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$playCount",
                    },
                },
            },
        ]);

        return res.json({
            success: true,
            data: {
                totalSongs,
                totalPlays: totalPlays[0]?.total || 0,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};