import mongoose from "mongoose";

const currentYear = new Date().getFullYear();

const albumSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Album title is required"],
            trim: true,
            minlength: [1, "Album title cannot be empty"],
            maxlength: [200, "Album title cannot exceed 200 characters"],
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

        releaseYear: {
            type: Number,
            min: [1900, "Release year must be 1900 or later"],
            max: [
                currentYear,
                `Release year cannot be greater than ${currentYear}`,
            ],
        },
    },
    {
        timestamps: true,
    }
);

// ===========================
// ALBUM -> SONGS RELATIONSHIP
// ===========================
albumSchema.virtual("songs", {
    ref: "Song",
    localField: "_id",
    foreignField: "albumId",
});

albumSchema.set("toJSON", {
    virtuals: true,
});

albumSchema.set("toObject", {
    virtuals: true,
});

const Album = mongoose.model("Album", albumSchema);

export default Album;