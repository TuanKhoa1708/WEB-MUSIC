import express from "express";
import {
    getUsers,
    getUserById,
    toggleUserStatus,
    updateMe,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// All user management routes are admin-only
router.get(
    "/",
    protect,
    authorize("admin"),
    getUsers
);

router.get(
    "/:id",
    protect,
    authorize("admin"),
    getUserById
);

router.patch(
    "/:id/status",
    protect,
    authorize("admin"),
    toggleUserStatus
);

// Self-service: any authenticated user can update their own profile
router.put("/me", protect, updateMe);

export default router;
