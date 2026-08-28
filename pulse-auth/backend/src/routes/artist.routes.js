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

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

// ===========================
// STATISTICS & REVENUE (AS-133 & AS-134)
// ===========================

router.get("/stats", getArtistStats);

router.get(
    "/me/dashboard-stats",
    protect,
    authorize("artist", "admin"),
    getArtistDashboardStats
);

// Route tính toán doanh thu Premium và thống kê doanh thu cho nghệ sĩ
router.get(
    "/me/revenue",
    protect,
    authorize("artist", "admin"),
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