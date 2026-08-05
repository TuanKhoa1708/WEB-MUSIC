import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        stageName: {
            type: String,
            required: true,
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
        },

        socialLinks: {
            facebook: {
                type: String,
                default: "",
            },
            instagram: {
                type: String,
                default: "",
            },
            youtube: {
                type: String,
                default: "",
            },
        },
    },
    {
        timestamps: true,
    }
);

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;