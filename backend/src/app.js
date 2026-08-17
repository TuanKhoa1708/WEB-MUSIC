import express from "express";
import cors from "cors";

import songRoutes from "./routes/song.routes.js";
import authRoutes from "./routes/auth.routes.js";
import artistRoutes from "./routes/artist.routes.js";
import albumRoutes from "./routes/album.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import playlistSongRoutes from "./routes/playlistSong.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import historyRoutes from "./routes/history.routes.js";
import listenerRoutes from "./routes/listener.routes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend is running 🚀",
    });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Artist Routes
app.use("/api/artists", artistRoutes);

// Album Routes
app.use("/api/albums", albumRoutes);

// Playlist Routes
app.use("/api/playlists", playlistRoutes);

// Playlist Song Routes
app.use("/api/playlist-songs", playlistSongRoutes);

// Favorite Routes
app.use("/api/favorites", favoriteRoutes);

// History Routes
app.use("/api/history", historyRoutes);

// Song Routes
app.use("/api/songs", songRoutes);

app.use("/api/listeners", listenerRoutes);

export default app;