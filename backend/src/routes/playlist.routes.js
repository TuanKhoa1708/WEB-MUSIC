import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

import {
    createPlaylist,
    getPlaylists,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    getPlaylistStats,
    getPlaylistsByArtist,
} from "../controllers/playlist.controller.js";

const router = express.Router();

// ===========================
// STATISTICS
// ===========================

router.get("/stats", getPlaylistStats);

// ===========================
// PLAYLISTS BY ARTIST
// ===========================

router.get(
    "/artist/:artistId",
    getPlaylistsByArtist
);

// ===========================
// CRUD
// ===========================

router.post(
    "/",
    protect,
    authorize("artist", "admin"),
    createPlaylist
);

router.get("/", getPlaylists);

router.get("/:id", getPlaylistById);

router.put(
    "/:id",
    protect,
    authorize("artist", "admin"),
    updatePlaylist
);

router.delete(
    "/:id",
    protect,
    authorize("artist", "admin"),
    deletePlaylist
);

export default router;