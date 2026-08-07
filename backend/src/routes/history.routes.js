import express from "express";

import {
    addHistory,
    getHistory,
    getHistoryById,
    deleteHistory,
    clearHistory,
} from "../controllers/history.controller.js";

const router = express.Router();

// Clear user's history
router.delete("/clear", clearHistory);

// Get history
router.get("/", getHistory);

// Add song to history
router.post("/", addHistory);

// Get history detail
router.get("/:id", getHistoryById);

// Delete one history item
router.delete("/:id", deleteHistory);

export default router;