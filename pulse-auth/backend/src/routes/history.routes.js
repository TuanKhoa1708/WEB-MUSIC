import express from "express";

import {
    addHistory,
    getHistory,
    getHistoryById,
    deleteHistory,
    clearHistory,
} from "../controllers/history.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All history APIs require login
router.use(protect);

// Clear current user's history
router.delete("/clear", clearHistory);

// Get current user's history
router.get("/", getHistory);

// Add song to history
router.post("/", addHistory);

// Get history detail
router.get("/:id", getHistoryById);

// Delete one history item
router.delete("/:id", deleteHistory);

export default router;