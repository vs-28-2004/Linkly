import mongoose from "mongoose";

const DAY_MS = 24 * 60 * 60 * 1000;

const storySchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    content: { type: String, default: "", maxlength: 500 },
    media_url: { type: String, default: "" },
    media_type: { type: String, enum: ["text", "image", "video"], default: "text" },
    background_color: { type: String, default: "#cf3f09" },
    views: [{ type: String, ref: "User" }],
    // Story stops being shown at this date and is then deleted automatically (TTL index below).
    expiresAt: { type: Date, default: () => new Date(Date.now() + DAY_MS) },
    createdAt: { type: Date, default: Date.now },
});

// TTL index: MongoDB removes each story once its expiresAt date has passed (checked about once a minute).
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model("Story", storySchema);

export default Story;
