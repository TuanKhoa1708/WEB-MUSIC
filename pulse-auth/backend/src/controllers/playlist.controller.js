import mongoose from "mongoose";
import Playlist from "../models/Playlist.js";
import PlaylistSong from "../models/PlaylistSong.js";
import Artist from "../models/Artist.js";

// ===========================
// CREATE PLAYLIST
// ===========================
export const createPlaylist = async (req, res) => {
    try {
        const {
            title,
            description,
            coverUrl,
            isPublic,
            artistId,
        } = req.body;

        // ===========================
        // VALIDATE TITLE
        // ===========================
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: "Playlist title is required",
            });
        }

        let currentArtistId;

        // ===========================
        // IF USER IS ARTIST
        // ===========================
        if (req.user.role === "artist") {
            const artist = await Artist.findOne({
                userId: req.user._id,
            });

            if (!artist) {
                return res.status(404).json({
                    success: false,
                    message: "Artist profile not found",
                });
            }

            currentArtistId = artist._id;
        }

        // ===========================
        // IF USER IS ADMIN
        // ===========================
        if (req.user.role === "admin") {
            if (!artistId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Artist ID is required when admin creates a playlist",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(artistId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid artist ID",
                });
            }

            const artist = await Artist.findById(artistId);

            if (!artist) {
                return res.status(404).json({
                    success: false,
                    message: "Artist not found",
                });
            }

            currentArtistId = artist._id;
        }

        // ===========================
        // CREATE PLAYLIST
        // ===========================
        const playlist = await Playlist.create({
            title: title.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : "",
            artistId: currentArtistId,
            coverUrl:
                typeof coverUrl === "string"
                    ? coverUrl.trim()
                    : "",
            isPublic:
                typeof isPublic === "boolean"
                    ? isPublic
                    : false,
        });

        const populatedPlaylist = await Playlist.findById(
            playlist._id
        ).populate(
            "artistId",
            "stageName avatarUrl"
        );

        return res.status(201).json({
            success: true,
            message: "Playlist created successfully",
            data: populatedPlaylist,
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

        // ===========================
        // VALIDATE PAGE
        // ===========================
        if (
            !Number.isInteger(pageNumber) ||
            pageNumber < 1
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Page must be a positive integer",
            });
        }

        // ===========================
        // VALIDATE LIMIT
        // ===========================
        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Limit must be an integer between 1 and 100",
            });
        }

        const query = {};

        // ===========================
        // SEARCH BY TITLE
        // ===========================
        if (
            typeof keyword === "string" &&
            keyword.trim()
        ) {
            query.title = {
                $regex: keyword.trim(),
                $options: "i",
            };
        }

        // ===========================
        // FILTER BY ARTIST
        // ===========================
        if (artistId) {
            if (
                !mongoose.Types.ObjectId.isValid(
                    artistId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid artist ID",
                });
            }

            query.artistId = artistId;
        }

        const total =
            await Playlist.countDocuments(query);

        const playlists =
            await Playlist.find(query)
                .populate(
                    "artistId",
                    "stageName avatarUrl"
                )
                .sort({
                    createdAt: -1,
                })
                .skip(
                    (pageNumber - 1) *
                    limitNumber
                )
                .limit(limitNumber);

        return res.json({
            success: true,
            data: playlists,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(
                total / limitNumber
            ),
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
export const getPlaylistsByArtist =
    async (req, res) => {
        try {
            const { artistId } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(
                    artistId
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid artist ID",
                });
            }

            const playlists =
                await Playlist.find({
                    artistId,
                })
                    .populate(
                        "artistId",
                        "stageName avatarUrl"
                    )
                    .sort({
                        createdAt: -1,
                    });

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
export const getPlaylistById =
    async (req, res) => {
        try {
            const { id } = req.params;

            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid playlist ID",
                });
            }

            const playlist =
                await Playlist.findById(id)
                    .populate(
                        "artistId",
                        "stageName avatarUrl"
                    );

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
export const updatePlaylist =
    async (req, res) => {
        try {
            const { id } = req.params;

            // ===========================
            // VALIDATE PLAYLIST ID
            // ===========================
            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid playlist ID",
                });
            }

            // ===========================
            // FIND PLAYLIST
            // ===========================
            const playlist =
                await Playlist.findById(id);

            if (!playlist) {
                return res.status(404).json({
                    success: false,
                    message: "Playlist not found",
                });
            }

            // ===========================
            // CHECK OWNERSHIP FOR ARTIST
            // ===========================
            if (req.user.role === "artist") {
                const artist =
                    await Artist.findOne({
                        userId: req.user._id,
                    });

                if (!artist) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Artist profile not found",
                    });
                }

                if (
                    !playlist.artistId.equals(
                        artist._id
                    )
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "You do not have permission to update this playlist",
                    });
                }
            }

            // ===========================
            // GET UPDATE DATA
            // ===========================
            const {
                title,
                description,
                coverUrl,
                isPublic,
                artistId,
            } = req.body;

            const updateData = {};

            // ===========================
            // UPDATE TITLE
            // ===========================
            if (title !== undefined) {
                if (
                    typeof title !== "string" ||
                    !title.trim()
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Playlist title cannot be empty",
                    });
                }

                updateData.title =
                    title.trim();
            }

            // ===========================
            // UPDATE DESCRIPTION
            // ===========================
            if (description !== undefined) {
                if (
                    typeof description !== "string"
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Description must be a string",
                    });
                }

                updateData.description =
                    description.trim();
            }

            // ===========================
            // UPDATE COVER URL
            // ===========================
            if (coverUrl !== undefined) {
                if (
                    typeof coverUrl !== "string"
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Cover URL must be a string",
                    });
                }

                updateData.coverUrl =
                    coverUrl.trim();
            }

            // ===========================
            // UPDATE PUBLIC STATUS
            // ===========================
            if (isPublic !== undefined) {
                if (
                    typeof isPublic !== "boolean"
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "isPublic must be a boolean",
                    });
                }

                updateData.isPublic =
                    isPublic;
            }

            // ===========================
            // ADMIN CAN CHANGE ARTIST
            // ===========================
            if (
                artistId !== undefined &&
                req.user.role === "admin"
            ) {
                if (
                    !mongoose.Types.ObjectId.isValid(
                        artistId
                    )
                ) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid artist ID",
                    });
                }

                const artist =
                    await Artist.findById(artistId);

                if (!artist) {
                    return res.status(404).json({
                        success: false,
                        message: "Artist not found",
                    });
                }

                updateData.artistId =
                    artist._id;
            }

            // ===========================
            // CHECK UPDATE DATA
            // ===========================
            if (
                Object.keys(updateData).length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "No fields to update",
                });
            }

            // ===========================
            // UPDATE PLAYLIST
            // ===========================
            const updatedPlaylist =
                await Playlist.findByIdAndUpdate(
                    id,
                    updateData,
                    {
                        new: true,
                        runValidators: true,
                    }
                ).populate(
                    "artistId",
                    "stageName avatarUrl"
                );

            return res.json({
                success: true,
                message:
                    "Playlist updated successfully",
                data: updatedPlaylist,
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
export const deletePlaylist =
    async (req, res) => {
        try {
            const { id } = req.params;

            // ===========================
            // VALIDATE PLAYLIST ID
            // ===========================
            if (
                !mongoose.Types.ObjectId.isValid(id)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid playlist ID",
                });
            }

            // ===========================
            // FIND PLAYLIST
            // ===========================
            const playlist =
                await Playlist.findById(id);

            if (!playlist) {
                return res.status(404).json({
                    success: false,
                    message: "Playlist not found",
                });
            }

            // ===========================
            // CHECK OWNERSHIP FOR ARTIST
            // ===========================
            if (req.user.role === "artist") {
                const artist =
                    await Artist.findOne({
                        userId: req.user._id,
                    });

                if (!artist) {
                    return res.status(404).json({
                        success: false,
                        message:
                            "Artist profile not found",
                    });
                }

                if (
                    !playlist.artistId.equals(
                        artist._id
                    )
                ) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "You do not have permission to delete this playlist",
                    });
                }
            }

            // ===========================
            // DELETE PLAYLIST SONGS
            // ===========================
            await PlaylistSong.deleteMany({
                playlistId: playlist._id,
            });

            // ===========================
            // DELETE PLAYLIST
            // ===========================
            await playlist.deleteOne();

            return res.json({
                success: true,
                message:
                    "Playlist deleted successfully",
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
export const getPlaylistStats =
    async (req, res) => {
        try {
            const totalPlaylists =
                await Playlist.countDocuments();

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