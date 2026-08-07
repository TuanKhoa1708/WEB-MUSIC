import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
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

        avatarUrl: {
            type: String,
            default: "",
        },

        coverImage: {
            type: String,
            default: "",
        },

        followers: {
            type: Number,
            default: 0,
            min: 0,
        },

        socialLinks: {
            type: Map,
            of: String,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;