import express from "express";

import {
    getListeners,
    getListenerById,
    updateListener,
    deleteListener,
    getListenerStats,
} from "../controllers/listener.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// All Listener Management APIs require Admin
router.use(protect);
router.use(authorize("admin"));

// Statistics
router.get("/stats", getListenerStats);

// Listener Management
router.get("/", getListeners);

router.get("/:id", getListenerById);

router.put("/:id", updateListener);

router.delete("/:id", deleteListener);

export default router;