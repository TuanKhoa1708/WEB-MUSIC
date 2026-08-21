import express from "express";

import {
    addSongToPlaylist,
    getPlaylistSongs,
    updatePlaylistSong,
    removeSongFromPlaylist,
} from "../controllers/playlistSong.controller.js";

const router = express.Router();

// Add song to playlist
router.post("/", addSongToPlaylist);

// Get all songs in a playlist
router.get("/playlist/:playlistId", getPlaylistSongs);

// Update song position
router.put("/:id", updatePlaylistSong);

// Remove song from playlist
router.delete("/:id", removeSongFromPlaylist);

export default router;