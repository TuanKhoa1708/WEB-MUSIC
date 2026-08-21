import ArtistRequest from "../models/ArtistRequest.js";
import Artist from "../models/Artist.js";
import User from "../models/User.js";

// @desc    Apply to become an artist
// @route   POST /api/artist-requests
// @access  Private
export const applyToBecomeArtist = async (req, res) => {
    try {
        const { stageName, bio, socialLinks } = req.body;
        const userId = req.user.userId; // assuming auth middleware sets req.user.userId

        // Check if user is already an artist
        const user = await User.findById(userId);
        if (user.role === "artist") {
            return res.status(400).json({ message: "You are already an artist" });
        }

        // Check if there is already a pending request
        const existingRequest = await ArtistRequest.findOne({ userId, status: "pending" });
        if (existingRequest) {
            return res.status(400).json({ message: "You already have a pending application" });
        }

        const newRequest = new ArtistRequest({
            userId,
            stageName,
            bio,
            socialLinks,
        });

        await newRequest.save();

        res.status(201).json(newRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's request
// @route   GET /api/artist-requests/my-request
// @access  Private
export const getMyRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Sort by createdAt desc to get the latest request
        const request = await ArtistRequest.findOne({ userId }).sort({ createdAt: -1 });
        
        if (!request) {
            return res.status(404).json({ message: "No request found" });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all artist requests (admin)
// @route   GET /api/artist-requests
// @access  Private/Admin
export const getArtistRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        
        if (status) {
            query.status = status;
        }

        const requests = await ArtistRequest.find(query)
            .populate("userId", "fullName email avatarUrl")
            .sort({ createdAt: -1 });
            
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve an artist request
// @route   PUT /api/artist-requests/:id/approve
// @access  Private/Admin
export const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ArtistRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        // 1. Update request status
        request.status = "approved";
        await request.save();

        // 2. Change user role to artist
        const user = await User.findById(request.userId);
        if (user) {
            user.role = "artist";
            await user.save();
        }

        // 3. Create Artist record
        // Check if artist record already exists just in case
        let artist = await Artist.findOne({ userId: request.userId });
        if (!artist) {
            artist = new Artist({
                userId: request.userId,
                stageName: request.stageName,
                bio: request.bio,
                socialLinks: request.socialLinks,
                avatarUrl: user?.avatarUrl || "",
            });
            await artist.save();
        }

        res.json({ message: "Artist request approved successfully", request, artist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject an artist request
// @route   PUT /api/artist-requests/:id/reject
// @access  Private/Admin
export const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminMessage } = req.body;

        const request = await ArtistRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (request.status !== "pending") {
            return res.status(400).json({ message: `Request is already ${request.status}` });
        }

        request.status = "rejected";
        if (adminMessage) {
            request.adminMessage = adminMessage;
        }
        await request.save();

        res.json({ message: "Artist request rejected", request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
