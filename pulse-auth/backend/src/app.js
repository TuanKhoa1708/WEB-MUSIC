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
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import artistRequestRoutes from "./routes/artistRequest.routes.js";
import listenerRoutes from "./routes/listener.routes.js";
import searchRoutes from "./routes/search.routes.js";
const app = express();

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.vercel.app') ||
            origin.endsWith('.onrender.com')
        ) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

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

// Upload Routes
app.use("/api/upload", uploadRoutes);

// User Management Routes (Admin only)
app.use("/api/users", userRoutes);

// Artist Requests Routes
app.use("/api/artist-requests", artistRequestRoutes);

// Listener Routes
app.use("/api/listeners", listenerRoutes);

// Search Routes
app.use("/api/search", searchRoutes);
export default app;