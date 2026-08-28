import Notification from "../models/Notification.js";

// ─── GET /api/notifications ──────────────────────────────────────────────────
// Protected: Get all notifications for the current user
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 for performance
            
        return res.json({ success: true, data: notifications });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
// Protected: Mark a specific notification as read
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.json({ success: true, data: notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
// Protected: Mark all notifications as read for current user
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );

        return res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
