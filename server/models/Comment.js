import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
    {
        comment: { type: String },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true },
);

export default mongoose.model("Comment", CommentSchema);
