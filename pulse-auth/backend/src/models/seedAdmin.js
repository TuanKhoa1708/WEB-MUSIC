import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./User.js";

// Load environment variables (assumes script is run from backend root)
dotenv.config();

const seedAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@pulse.com" });
        if (existingAdmin) {
            console.log("⚠️ Admin account already exists!");
        } else {
            const hashedPassword = await bcrypt.hash("Admin@123", 10);

            await User.create({
                fullName: "Administrator",
                username: "admin",
                email: "admin@pulse.com",
                password: hashedPassword,
                avatarUrl: "",
                role: "admin",
                isVerified: true,
                isActive: true
            });

            console.log("✅ Admin created successfully!");
        }

        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();