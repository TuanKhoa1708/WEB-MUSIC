import User from "../models/User.js";

// ===========================
// SUBSCRIBE TO PREMIUM
// ===========================
export const subscribePremium = async (req, res) => {
    try {
        const { plan } = req.body; // Bắt buộc truyền lên: "individual" hoặc "student"
        const userId = req.user._id;

        // Validate gói cước
        if (!["individual", "student"].includes(plan)) {
            return res.status(400).json({
                success: false,
                message: "Invalid premium plan. Choose 'individual' or 'student'.",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Tính toán ngày hết hạn
        const now = new Date();
        let expiryDate = new Date();

        if (plan === "individual") {
            // Gói Individual: +3 tháng
            expiryDate.setMonth(now.getMonth() + 3);
        } else if (plan === "student") {
            // Gói Student: +2 tháng
            expiryDate.setMonth(now.getMonth() + 2);
        }

        // Cập nhật thông tin User
        user.isPremium = true;
        user.premiumPlan = plan;
        user.premiumExpiry = expiryDate;

        await user.save();

        return res.json({
            success: true,
            message: `Successfully subscribed to ${plan} premium plan!`,
            data: {
                isPremium: user.isPremium,
                premiumPlan: user.premiumPlan,
                premiumExpiry: user.premiumExpiry,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ===========================
// CHECK PREMIUM STATUS
// ===========================
export const checkPremiumStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Kiểm tra xem hạn Premium đã qua chưa
        const now = new Date();
        let isExpired = false;

        if (user.isPremium && user.premiumExpiry && now > user.premiumExpiry) {
            // Nếu đã quá hạn -> Reset về tài khoản Free
            user.isPremium = false;
            user.premiumPlan = "none";
            user.premiumExpiry = null;
            await user.save();
            isExpired = true;
        }

        return res.json({
            success: true,
            data: {
                isPremium: user.isPremium,
                premiumPlan: user.premiumPlan,
                premiumExpiry: user.premiumExpiry,
                isExpired,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};