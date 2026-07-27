import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

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

export default app;