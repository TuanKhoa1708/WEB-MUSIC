import PlaylistSong from "../models/PlaylistSong.js";

// ===========================
// ADD SONG TO PLAYLIST
// ===========================
export const addSongToPlaylist = async (req, res) => {
    try {
        const playlistSong = await PlaylistSong.create(req.body);

        return res.status(201).json({
            success: true,
            message: "Song added to playlist successfully",
            data: playlistSong,
        });
    } catch (error) {
        // Duplicate playlist + song
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Song already exists in this playlist",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// GET SONGS IN PLAYLIST
// ===========================
export const getPlaylistSongs = async (req, res) => {
    try {
        const playlistSongs = await PlaylistSong.find({
            playlistId: req.params.playlistId,
        })
            .populate("songId")
            .sort({ order: 1, createdAt: 1 });

        return res.json({
            success: true,
            data: playlistSongs,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// UPDATE PLAYLIST SONG
// ===========================
export const updatePlaylistSong = async (req, res) => {
    try {
        const playlistSong = await PlaylistSong.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!playlistSong) {
            return res.status(404).json({
                success: false,
                message: "Playlist song not found",
            });
        }

        return res.json({
            success: true,
            message: "Playlist song updated successfully",
            data: playlistSong,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// REMOVE SONG FROM PLAYLIST
// ===========================
export const removeSongFromPlaylist = async (req, res) => {
    try {
        const playlistSong = await PlaylistSong.findByIdAndDelete(
            req.params.id
        );

        if (!playlistSong) {
            return res.status(404).json({
                success: false,
                message: "Playlist song not found",
            });
        }

        return res.json({
            success: true,
            message: "Song removed from playlist successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};