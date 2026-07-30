import mongoose from "mongoose";

const artistSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Artist name is required"],
            trim: true,
        },
        bio: {
            type: String,
            default: "",
        },
        imageUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const Artist = mongoose.model("Artist", artistSchema);

export default Artist;
