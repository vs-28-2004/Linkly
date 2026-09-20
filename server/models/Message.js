import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: String, ref: "User", required: true },
    receiver: { type: String, ref: "User", required: true },
    content: { type: String, default: "", maxlength: 2000 },
    media_url: { type: String, default: "" },
    message_type: { type: String, enum: ["text", "image"], default: "text" },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, read: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
