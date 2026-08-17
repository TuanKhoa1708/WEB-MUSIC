import express from "express";
import {
    getUsers,
    getUserById,
    toggleUserStatus,
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

export default router;
