import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Notification from "../models/Notification.js";
import crypto from "crypto";

// ─── GET /api/subscriptions/packages ──────────────────────────────────────────
// Public: returns all active subscription plans.
export const getPackages = async (req, res) => {
    try {
        const packages = await Subscription.find({ isActive: true }).sort({ price: 1 });
        return res.json({ success: true, data: packages });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/subscriptions/me ────────────────────────────────────────────────
// Protected: returns the current user's subscription status.
export const getMySubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            "isPremium subscriptionPlan subscriptionExpiresAt subscriptionStartedAt"
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if subscription is expired
        const now = new Date();
        const isExpired =
            user.subscriptionExpiresAt && user.subscriptionExpiresAt < now;

        // Auto-downgrade if expired
        if (user.isPremium && isExpired) {
            user.isPremium = false;
            user.subscriptionPlan = "free";
            await user.save();
        } else if (user.isPremium && !isExpired && user.subscriptionExpiresAt) {
            // Check if expiring within 3 days
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            const timeUntilExpiry = user.subscriptionExpiresAt - now;
            if (timeUntilExpiry <= threeDays) {
                // Check if we already warned them in the last 3 days
                const recentWarning = await Notification.findOne({
                    userId: user._id,
                    type: "warning",
                    createdAt: { $gte: new Date(now - threeDays) }
                });

                if (!recentWarning) {
                    await Notification.create({
                        userId: user._id,
                        title: "Premium expiring soon",
                        message: "Your Premium subscription will expire in less than 3 days. Please renew to keep enjoying ad-free music and high quality audio.",
                        type: "warning"
                    });
                }
            }
        }

        return res.json({
            success: true,
            data: {
                isPremium: user.isPremium,
                subscriptionPlan: user.subscriptionPlan,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
                subscriptionStartedAt: user.subscriptionStartedAt,
                isExpired: isExpired || false,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/subscriptions/checkout ─────────────────────────────────────────
// Protected: initiates a premium subscription purchase (demo MoMo flow).
export const checkout = async (req, res) => {
    try {
        const { packageId } = req.body;

        if (!packageId) {
            return res.status(400).json({
                success: false,
                message: "packageId is required",
            });
        }

        const plan = await Subscription.findById(packageId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                message: "Subscription plan not found",
            });
        }

        // Check if user is already Premium
        const user = await User.findById(req.user._id).select("isPremium subscriptionExpiresAt");
        if (user.isPremium && user.subscriptionExpiresAt > new Date()) {
            return res.status(409).json({
                success: false,
                message: "You already have an active Premium subscription.",
            });
        }

        // Generate a demo orderId for this checkout session
        const orderId = "PULSE" + crypto.randomBytes(5).toString("hex").toUpperCase();

        return res.json({
            success: true,
            data: {
                status: "momo_pending",
                orderId,
                plan: {
                    id: plan._id,
                    name: plan.name,
                    price: plan.price,
                    currency: plan.currency,
                    billingPeriod: plan.billingPeriod,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/subscriptions/demo-confirm ─────────────────────────────────────
// Protected: demo payment confirmation (MoMo simulation).
// This endpoint is ONLY for demonstration purposes. It simulates a
// payment gateway webhook by activating Premium upon request.
export const demoConfirmPayment = async (req, res) => {
    try {
        const { orderId, packageId, paymentMethod = "MOMO" } = req.body;

        if (!orderId || !packageId) {
            return res.status(400).json({
                success: false,
                message: "orderId and packageId are required",
            });
        }

        const plan = await Subscription.findById(packageId);
        if (!plan || !plan.isActive) {
            return res.status(404).json({
                success: false,
                message: "Subscription plan not found",
            });
        }

        // Check if user is already Premium (idempotent)
        const existingUser = await User.findById(req.user._id).select("isPremium subscriptionExpiresAt");
        if (existingUser.isPremium && existingUser.subscriptionExpiresAt > new Date()) {
            return res.json({
                success: true,
                data: {
                    alreadyActive: true,
                    paymentStatus: "COMPLETED",
                    subscriptionStatus: "ACTIVE",
                    message: "Subscription is already active.",
                },
            });
        }

        // Activate premium
        await activatePremium(req.user._id, plan);

        // Fetch updated user data
        const updatedUser = await User.findById(req.user._id).select(
            "isPremium subscriptionPlan subscriptionExpiresAt subscriptionStartedAt"
        );

        // Generate a demo transaction ID
        const transactionId = "TXN" + Date.now() + crypto.randomBytes(3).toString("hex").toUpperCase();

        return res.json({
            success: true,
            data: {
                paymentStatus: "COMPLETED",
                subscriptionStatus: "ACTIVE",
                paymentMethod,
                orderId,
                transactionId,
                amount: plan.price,
                currency: plan.currency,
                activatedAt: updatedUser.subscriptionStartedAt,
                expiresAt: updatedUser.subscriptionExpiresAt,
                user: {
                    isPremium: updatedUser.isPremium,
                    subscriptionPlan: updatedUser.subscriptionPlan,
                    subscriptionExpiresAt: updatedUser.subscriptionExpiresAt,
                    subscriptionStartedAt: updatedUser.subscriptionStartedAt,
                },
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/subscriptions/activate ─────────────────────────────────────────
// Protected (internal or webhook): activates premium for a user.
// Called by payment webhook on successful payment.
export const activateSubscription = async (req, res) => {
    try {
        const { userId, packageId } = req.body;

        const plan = await Subscription.findById(packageId);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }

        await activatePremium(userId || req.user._id, plan);

        const user = await User.findById(userId || req.user._id).select(
            "isPremium subscriptionPlan subscriptionExpiresAt subscriptionStartedAt"
        );

        return res.json({ success: true, data: user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DELETE /api/subscriptions/me ─────────────────────────────────────────────
// Protected: cancels the current user's premium subscription.
export const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isPremium = false;
        user.subscriptionPlan = "free";
        user.subscriptionExpiresAt = null;
        user.subscriptionStartedAt = null;
        await user.save();

        await Notification.create({
            userId: user._id,
            title: "Premium Cancelled",
            message: "Your Premium subscription has been successfully cancelled. You now have a Free account.",
            type: "info"
        });

        return res.json({
            success: true,
            message: "Subscription cancelled successfully.",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Helper: activate premium on a user ───────────────────────────────────────
async function activatePremium(userId, plan) {
    const now = new Date();
    let expiresAt = new Date(now);

    if (plan.billingPeriod === "monthly") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else if (plan.billingPeriod === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else if (plan.billingPeriod === "lifetime") {
        expiresAt = new Date("2099-12-31");
    }

    await User.findByIdAndUpdate(userId, {
        isPremium: true,
        subscriptionPlan: "premium",
        subscriptionStartedAt: now,
        subscriptionExpiresAt: expiresAt,
    });

    await Notification.create({
        userId,
        title: "Premium Activated 🎉",
        message: `Your Premium subscription (${plan.name}) has been activated successfully! Enjoy your music universe.`,
        type: "success"
    });
}
