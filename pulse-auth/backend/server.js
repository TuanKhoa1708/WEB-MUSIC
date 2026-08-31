import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();
console.log("MONGODB_URI =", process.env.MONGODB_URI);

// Kết nối MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.IO is ready`);
});