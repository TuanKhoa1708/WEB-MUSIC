import express from "express";

import {
    createArtist,
    getArtists,
    getArtistById,
    updateArtist,
    deleteArtist,
    getArtistStats,
    getArtistDashboardStats,
    getArtistRevenue, // <-- 1. Thêm import hàm doanh thu
} from "../controllers/artist.controller.js";

const router = express.Router();

// ===========================
// STATISTICS & REVENUE (AS-133 & AS-134)
// ===========================

router.get("/stats", getArtistStats);

router.get(
    "/:id/dashboard-stats",
    getArtistDashboardStats
);

// Route tính toán doanh thu Premium và thống kê doanh thu cho nghệ sĩ
router.get(
    "/:id/revenue",
    getArtistRevenue
); // <-- 2. Thêm route này vào đây

// ===========================
// CRUD
// ===========================

router.post("/", createArtist);

router.get("/", getArtists);

router.get("/:id", getArtistById);

router.put("/:id", updateArtist);

router.delete("/:id", deleteArtist);

export default router;