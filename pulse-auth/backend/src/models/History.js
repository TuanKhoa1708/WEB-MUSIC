import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
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

        listenedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const History = mongoose.model("History", historySchema);

export default History;