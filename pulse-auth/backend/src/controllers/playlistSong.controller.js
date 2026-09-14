import PlaylistSong from "../models/PlaylistSong.js";
import User from "../models/User.js"; // Import model User để kiểm tra Premium

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
// GET SONGS IN PLAYLIST (FREE TIER LIMIT APPLIED)
// ===========================
export const getPlaylistSongs = async (req, res) => {
    try {
        const playlistSongs = await PlaylistSong.find({
            playlistId: req.params.playlistId,
        })
            .populate("songId")
            .sort({ order: 1, createdAt: 1 });

        // 1. Kiểm tra trạng thái Premium của user (nếu có đăng nhập)
        let isPremium = false;
        if (req.user && req.user._id) {
            const user = await User.findById(req.user._id);
            if (user && user.isPremium) {
                isPremium = true;
            }
        }

        // 2. Xử lý giới hạn 4 bài cho tài khoản Free
        const processedSongs = playlistSongs.map((item, index) => {
            const psObj = item.toObject(); // Chuyển sang Object thuần để dễ can thiệp dữ liệu

            // Nếu không phải Premium và là bài thứ 5 trở đi (index >= 4)
            if (!isPremium && index >= 4) {
                if (psObj.songId) {
                    psObj.songId.audioUrl = ""; // Ẩn link nhạc
                    psObj.songId.requiresPremium = true; // Báo cho FE biết bài này cần Premium
                }
            }
            return psObj;
        });

        return res.json({
            success: true,
            data: processedSongs,
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