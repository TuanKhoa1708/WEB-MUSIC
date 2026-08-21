import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
    {
        playlistId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Playlist",
            required: [true, "Playlist is required"],
        },
        songId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
            required: [true, "Song is required"],
        },
        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Optional: ensure a song can only be added to a playlist once
playlistSongSchema.index({ playlistId: 1, songId: 1 }, { unique: true });

const PlaylistSong =
    mongoose.models.PlaylistSong ||
    mongoose.model("PlaylistSong", playlistSongSchema, "playlistSongs");

export default PlaylistSong;