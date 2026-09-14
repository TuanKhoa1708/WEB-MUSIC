import express from "express";
import {
    subscribePremium,
    checkPremiumStatus,
} from "../controllers/premium.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Bắt buộc đăng nhập mới được gọi các API này
router.use(protect);

// Đăng ký gói Premium
router.post("/subscribe", subscribePremium);

// Kiểm tra trạng thái Premium hiện tại
router.get("/status", checkPremiumStatus);

export default router;