import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
    {
        user: { type: String, ref: "User", required: true },
        content: { type: String, default: "", maxlength: 2000 },
        image_urls: [{ type: String }],
        post_type: {
            type: String,
            enum: ["text", "image", "text_with_image"],
            default: "text",
        },
        likes: [{ type: String, ref: "User" }],
        comments: [commentSchema],
        likes_count: { type: Number, default: 0 },
        comments_count: { type: Number, default: 0 },
    },
    { timestamps: true }
);

postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ likes: 1 });

const Post = mongoose.model("Post", postSchema);

export default Post;
