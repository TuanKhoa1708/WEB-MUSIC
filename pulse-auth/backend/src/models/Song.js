import mongoose from "mongoose";

const songSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Song title is required"],
            trim: true,
        },

        artistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artist",
            required: [true, "Artist is required"],
        },

        albumId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Album",
            default: null,
        },

        audioUrl: {
            type: String,
            required: [true, "Audio URL is required"],
        },

        coverUrl: {
            type: String,
            default: "",
        },

        duration: {
            type: Number,
            default: 0,
            min: 0,
        },

        genre: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        playCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Song = mongoose.model("Song", songSchema);

export default Song;