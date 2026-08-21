import express from "express";
import {
    applyToBecomeArtist,
    getMyRequest,
    getArtistRequests,
    approveRequest,
    rejectRequest
} from "../controllers/artistRequest.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// User routes
router.post("/", protect, applyToBecomeArtist);
router.get("/my-request", protect, getMyRequest);

// Admin routes
router.get("/", protect, authorize("admin"), getArtistRequests);
router.put("/:id/approve", protect, authorize("admin"), approveRequest);
router.put("/:id/reject", protect, authorize("admin"), rejectRequest);

export default router;
