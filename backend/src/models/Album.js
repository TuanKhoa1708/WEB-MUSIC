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

        order: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

playlistSongSchema.index(
    { playlistId: 1, songId: 1 },
    { unique: true }
);

const PlaylistSong = mongoose.model(
    "PlaylistSong",
    playlistSongSchema,
    "playlistSongs"
);

export default PlaylistSong;