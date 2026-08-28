import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { initListenRoomSocket } from "./src/socket/listenRoom.socket.js";

dotenv.config();
console.log("MONGODB_URI =", process.env.MONGODB_URI);

// Kết nối MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Attach Socket.IO
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Register socket handlers
initListenRoomSocket(io);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO is ready`);
});