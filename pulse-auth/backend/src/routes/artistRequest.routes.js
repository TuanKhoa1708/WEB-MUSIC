import express from "express";
import {
    applyToBecomeArtist,
    getMyRequest,
    getArtistRequests,
    approveRequest,
    rejectRequest,
    requestRevokeRole,
    approveRevokeRequest,
} from "../controllers/artistRequest.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// User routes
router.post("/", protect, applyToBecomeArtist);
router.get("/my-request", protect, getMyRequest);

// Artist self-revocation request
router.post("/revoke", protect, authorize("artist"), requestRevokeRole);

// Admin routes
router.get("/", protect, authorize("admin"), getArtistRequests);
router.put("/:id/approve", protect, authorize("admin"), approveRequest);
router.put("/:id/reject", protect, authorize("admin"), rejectRequest);
router.put("/:id/revoke-approve", protect, authorize("admin"), approveRevokeRequest);

export default router;
