import Song from "../models/Song.js";
import Artist from "../models/Artist.js";
import Album from "../models/Album.js";
import History from "../models/History.js";
import User from "../models/User.js";

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
            description,
        } = req.body;

        if (!title || !artistId || !audioUrl) {
            return res.status(400).json({
                success: false,
                message: "title, artistId and audioUrl are required",
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
            description: description || "",
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
// GET AI MUSIC RECOMMENDATIONS


export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Lấy 10 lịch sử nghe gần nhất của user để phân tích sở thích
        const userHistory = await History.find({ userId })
            .populate("songId")
            .sort({ playedAt: -1 })
            .limit(10);

        // Nếu user chưa nghe bài nào, trả về các bài hát thịnh hành (playCount cao)
        if (!userHistory || userHistory.length === 0) {
            const trendingSongs = await Song.find()
                .sort({ playCount: -1 })
                .limit(10)
                .populate("artistId", "stageName")
                .populate("albumId", "title");

            return res.json({
                success: true,
                message: "Recommended based on trending",
                data: trendingSongs,
            });
        }

        // 2. Thu thập danh sách các thể loại và ID bài hát đã nghe để loại trừ
        const genres = [];
        const listenedSongIds = [];

        userHistory.forEach((item) => {
            if (item.songId) {
                listenedSongIds.push(item.songId._id);
                if (item.songId.genre) {
                    genres.push(item.songId.genre);
                }
            }
        });

        // 3. Tìm các bài hát cùng thể loại mà user chưa nghe gần đây
        const recommendations = await Song.find({
            _id: { $nin: listenedSongIds },
            genre: { $in: genres },
        })
            .sort({ playCount: -1, createdAt: -1 })
            .limit(10)
            .populate("artistId", "stageName")
            .populate("albumId", "title");

        // Nếu số lượng gợi ý ít, bù thêm bằng các bài hát hot khác
        let finalRecommendations = recommendations;
        if (finalRecommendations.length < 5) {
            const extraSongs = await Song.find({
                _id: { $nin: [...listenedSongIds, ...recommendations.map(s => s._id)] }
            })
                .sort({ playCount: -1 })
                .limit(10 - finalRecommendations.length)
                .populate("artistId", "stageName")
                .populate("albumId", "title");

            finalRecommendations = [...finalRecommendations, ...extraSongs];
        }

        return res.json({
            success: true,
            message: "AI recommendations generated successfully",
            data: finalRecommendations,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// ===========================
// SKIP SONG (FREE TIER LIMIT)
// ===========================
export const skipSong = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // 1. Tài khoản Premium -> Bỏ qua mọi giới hạn
        if (user.isPremium) {
            return res.json({
                success: true,
                message: "Skipped successfully (Premium)",
                skipsLeft: "unlimited",
            });
        }

        // 2. Tài khoản Free -> Xử lý đếm lượt skip
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Mốc 0h00 hôm nay

        let lastSkip = user.lastSkipDate ? new Date(user.lastSkipDate) : null;
        if (lastSkip) {
            lastSkip = new Date(lastSkip.getFullYear(), lastSkip.getMonth(), lastSkip.getDate());
        }

        // Nếu là qua ngày mới -> Reset bộ đếm về 0
        if (!lastSkip || lastSkip.getTime() !== today.getTime()) {
            user.dailySkips = 0;
        }

        // 3. Kiểm tra xem đã hết lượt chưa (Tối đa 10 lần)
        if (user.dailySkips >= 10) {
            return res.status(403).json({
                success: false,
                message: "Bạn đã hết lượt chuyển bài hôm nay. Hãy nâng cấp Premium để nghe không giới hạn!",
                requiresPremium: true,
            });
        }

        // 4. Trừ đi 1 lượt skip và lưu lại
        user.dailySkips += 1;
        user.lastSkipDate = now;
        await user.save();

        return res.json({
            success: true,
            message: "Skipped successfully",
            skipsLeft: 10 - user.dailySkips,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};