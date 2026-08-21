import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Playlist title is required"],
            trim: true,
        },
        description: {
            type: String,
            default: "",
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        coverUrl: {
            type: String,
            default: "",
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
