import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// ================= REGISTER =================
export const register = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Kiểm tra dữ liệu
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields.",
            });
        }

        // Email đã tồn tại
        const emailExists = await User.findOne({ email });

        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists.",
            });
        }

        // Username đã tồn tại
        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tạo user
        const user = await User.create({
            fullName,
            username,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "Account created successfully.",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

// ================= LOGIN =================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra dữ liệu
        if (!email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields.",
            });
        }

        // Tìm user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password.",
            });
        }

        // So sánh password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password.",
            });
        }

        // Sinh JWT
        const accessToken = generateToken(user._id);

        res.status(200).json({
            accessToken,
            refreshToken: "",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};