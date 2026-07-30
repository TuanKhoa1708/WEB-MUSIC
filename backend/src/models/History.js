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
        playedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: "history" // Ensure collection name is 'history' instead of 'histories'
    }
);

const History = mongoose.model("History", historySchema);

export default History;
