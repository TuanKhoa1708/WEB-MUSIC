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
            trim: true,
        },

        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: [true, "Artist is required"],
        },

        coverUrl: {
            type: String,
            default: "",
            trim: true,
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