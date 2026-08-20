import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Artist from "./models/Artist.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedArtist = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in .env file");
        }

        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB Connected");

        const email = "artist@pulse.com";
        const username = "testartist";

        const existingUser = await User.findOne({ email });
        const hashedPassword = await bcrypt.hash("Artist@123", 10);
        
        if (existingUser) {
            existingUser.password = hashedPassword;
            if (existingUser.role !== 'artist') existingUser.role = 'artist';
            await existingUser.save();
            console.log("✅ Artist account password reset! Email:", email);
            await mongoose.disconnect();
            process.exit(0);
        }

        const newUser = await User.create({
            fullName: "The Weeknd",
            username,
            email,
            password: hashedPassword,
            avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/The_Weeknd_Cannes_2023.png",
            role: "artist",
            isVerified: true,
            isActive: true
        });

        await Artist.create({
            userId: newUser._id,
            stageName: "The Weeknd",
            bio: "Canadian singer, songwriter, and record producer.",
            avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/The_Weeknd_Cannes_2023.png",
            followers: 1000000,
        });

        console.log("✅ Artist created successfully!");
        console.log("Email:", email);
        console.log("Password: Artist@123");

        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding artist:", error);
        process.exit(1);
    }
};

seedArtist();
