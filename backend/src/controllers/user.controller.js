import User from "../models/User.js";

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Admin-only: list users with pagination, search, role filter, isActive filter.
// Password is NEVER returned.
export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            keyword = "",
            role,
            isActive,
        } = req.query;

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const query = {};

        // Keyword search: fullName, username, or email
        if (keyword) {
            query.$or = [
                { fullName: { $regex: keyword, $options: "i" } },
                { username: { $regex: keyword, $options: "i" } },
                { email:    { $regex: keyword, $options: "i" } },
            ];
        }

        // Role filter (defaults to "user" if not specified — only show listeners)
        if (role) {
            query.role = role;
        } else {
            // Default to listing only regular listeners
            query.role = "user";
        }

        // isActive filter (optional — undefined means show all)
        if (isActive !== undefined && isActive !== "") {
            query.isActive = isActive === "true";
        }

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select("-password") // NEVER return the password
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
// Admin-only: get a single user by ID.
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ─── PATCH /api/users/:id/status ──────────────────────────────────────────────
// Admin-only: toggle isActive status of a user (deactivate / reactivate).
// This is a soft operation — the user account is not deleted.
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Prevent admins from deactivating their own account
        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account.",
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        return res.json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
            data: user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
