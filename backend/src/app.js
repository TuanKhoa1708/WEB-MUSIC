import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import artistRoutes from "./routes/artist.routes.js";

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

export default app;