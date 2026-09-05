import mongoose from "mongoose";

const artistRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // 'become_artist' = user applying for artist role
        // 'revoke_artist' = artist requesting to step down
        type: {
            type: String,
            enum: ["become_artist", "revoke_artist"],
            default: "become_artist",
        },
        stageName: {
            type: String,
            required: [true, "Stage name is required"],
            trim: true,
        },
        bio: {
            type: String,
            default: "",
        },
        socialLinks: {
            type: Map,
            of: String,
            default: {},
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "revoke_pending", "revoke_approved"],
            default: "pending",
        },
        adminMessage: {
            type: String,
            default: "", // Reason for rejection or other notes
        },
        // Reason the artist provides when requesting role revocation
        revokeReason: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const ArtistRequest = mongoose.model("ArtistRequest", artistRequestSchema);

export default ArtistRequest;
