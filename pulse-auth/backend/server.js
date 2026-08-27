import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import setupSocket from "./src/socket/index.js"; // File quản lý phòng nghe chung

dotenv.config();
console.log("MONGODB_URI =", process.env.MONGODB_URI);

// Kết nối MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

// Tạo HTTP server từ app Express
const httpServer = createServer(app);

// Khởi tạo Socket.io với cấu hình CORS cho phép Frontend gọi tới
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Cho phép mọi domain kết nối (sau này có thể đổi thành link FE của bạn)
        methods: ["GET", "POST"]
    }
});

// Gọi hàm thiết lập logic cho các phòng nghe nhạc
setupSocket(io);

// Lắng nghe trên httpServer thay vì app (để chạy song song API và Socket)
httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});