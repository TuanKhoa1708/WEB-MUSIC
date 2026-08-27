import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },
        avatarUrl: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["user", "artist", "admin"],
            default: "user",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
            default: null,
        },

        // ===========================
        // PREMIUM & LIMITS FEATURES
        // ===========================
        isPremium: {
            type: Boolean,
            default: false,
        },
        premiumPlan: {
            type: String,
            enum: ["none", "individual", "student"],
            default: "none",
        },
        premiumExpiry: {
            type: Date,
            default: null,
        },
        dailySkips: {
            type: Number,
            default: 0,
            max: 10, // Giới hạn 10 lần skip
        },
        lastSkipDate: {
            type: Date,
            default: null, // Dùng để check qua ngày mới thì reset dailySkips về 0
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;