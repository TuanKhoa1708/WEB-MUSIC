import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Album title is required"],
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
        },
        releaseYear: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

const Album = mongoose.model("Album", albumSchema);

export default Album;