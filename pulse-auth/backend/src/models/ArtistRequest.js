import mongoose from "mongoose";

const artistRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        adminMessage: {
            type: String,
            default: "", // Reason for rejection or other notes
        }
    },
    {
        timestamps: true,
    }
);

const ArtistRequest = mongoose.model("ArtistRequest", artistRequestSchema);

export default ArtistRequest;
