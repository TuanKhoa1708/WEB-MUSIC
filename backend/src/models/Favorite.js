import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },

        songId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: [true, "Song is required"],
        },
    },
    {
        timestamps: true,
    }
);

// A user can only favorite a song once
favoriteSchema.index(
    { userId: 1, songId: 1 },
    { unique: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

export default Favorite;