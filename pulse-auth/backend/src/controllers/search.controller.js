import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Album from "../models/Album.js";
import Playlist from "../models/Playlist.js";

// ===========================
// GLOBAL SEARCH
// SEARCH SONGS + ARTISTS + ALBUMS + PLAYLISTS
// ===========================
export const globalSearch = async (req, res) => {
    try {
        const {
            keyword = "",
            limit = 10,
        } = req.query;

        // ===========================
        // VALIDATE KEYWORD
        // ===========================
        if (
            typeof keyword !== "string" ||
            !keyword.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Search keyword is required.",
            });
        }

        // ===========================
        // VALIDATE LIMIT
        // ===========================
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(limitNumber) ||
            limitNumber < 1 ||
            limitNumber > 50
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Limit must be an integer between 1 and 50.",
            });
        }

        // ===========================
        // SEARCH QUERY
        // ===========================
        const searchQuery = {
            $regex: keyword.trim(),
            $options: "i",
        };

        // ===========================
        // SEARCH SONGS
        // ===========================
        const songs = await Song.find({
            title: searchQuery,
        })
            .populate("artistId", "stageName avatarUrl")
            .populate("albumId", "title coverUrl")
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        // ===========================
        // SEARCH ARTISTS
        // ===========================
        const artists = await Artist.find({
            stageName: searchQuery,
        })
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        // ===========================
        // SEARCH ALBUMS
        // ===========================
        const albums = await Album.find({
            title: searchQuery,
        })
            .populate("artistId", "stageName avatarUrl")
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        // ===========================
        // SEARCH PLAYLISTS
        // ===========================
        const playlists = await Playlist.find({
            title: searchQuery,
            isPublic: true,
        })
            .populate("userId", "username")
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        // ===========================
        // RESPONSE
        // ===========================
        return res.json({
            success: true,
            keyword: keyword.trim(),
            data: {
                songs,
                artists,
                albums,
                playlists,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};