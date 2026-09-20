import Message from "../models/Message.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { CARD_FIELDS, toCard } from "../utils/users.js";
import { cleanText } from "../utils/text.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// POST /api/messages  (multipart: receiver, content?, image?)
// The sender is always the signed-in user — never taken from the request body.
export const sendMessage = async (req, res) => {
    try {
        const sender = req.userId;
        const receiver = String(req.body?.receiver || "");
        const content = cleanText(req.body?.content, 2000);

        if (!receiver) return fail(res, 400, "Receiver is required");
        if (receiver === sender) return fail(res, 400, "You can't message yourself");
        if (!content && !req.file) return fail(res, 400, "Write a message or attach an image");
        if (!(await User.exists({ _id: receiver }))) return fail(res, 404, "User not found");

        const mediaUrl = req.file ? await uploadToCloudinary(req.file.buffer, "linkly/messages") : "";

        const sent = await Message.create({
            sender,
            receiver,
            content,
            media_url: mediaUrl,
            message_type: mediaUrl ? "image" : "text",
        });

        res.status(201).json({ success: true, sent });
    } catch (error) {
        console.error("Send message error:", error);
        fail(res, error.status || 500, error.status ? error.message : "Failed to send message");
    }
};

// GET /api/messages/conversation/:userId — the latest 200 messages, oldest first.
// Opening a conversation marks the other person's messages as read.
export const getConversation = async (req, res) => {
    try {
        const me = req.userId;
        const other = req.params.userId;

        const otherUser = await User.findById(other).select(CARD_FIELDS).lean();
        if (!otherUser) return fail(res, 404, "User not found");

        const [latest] = await Promise.all([
            Message.find({
                $or: [
                    { sender: me, receiver: other },
                    { sender: other, receiver: me },
                ],
            })
                .sort({ createdAt: -1 })
                .limit(200)
                .lean(),
            Message.updateMany({ sender: other, receiver: me, read: false }, { $set: { read: true } }),
        ]);

        res.status(200).json({ success: true, user: toCard(otherUser), messages: latest.reverse() });
    } catch (error) {
        console.error("Get conversation error:", error);
        fail(res, 500, "Failed to load conversation");
    }
};

// GET /api/messages/conversations — one row per person you've chatted with, newest first
export const getConversations = async (req, res) => {
    try {
        const me = req.userId;

        const rows = await Message.aggregate([
            { $match: { $or: [{ sender: me }, { receiver: me }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: { $cond: [{ $eq: ["$sender", me] }, "$receiver", "$sender"] },
                    last_message: { $first: "$$ROOT" },
                    unread: {
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$receiver", me] }, { $eq: ["$read", false] }] }, 1, 0],
                        },
                    },
                },
            },
            { $sort: { "last_message.createdAt": -1 } },
            { $limit: 30 },
        ]);

        const users = await User.find({ _id: { $in: rows.map((r) => r._id) } })
            .select(CARD_FIELDS)
            .lean();
        const byId = new Map(users.map((u) => [u._id, toCard(u)]));

        const conversations = rows
            .filter((r) => byId.has(r._id))
            .map((r) => ({ user: byId.get(r._id), last_message: r.last_message, unread: r.unread }));

        res.status(200).json({ success: true, conversations });
    } catch (error) {
        console.error("Get conversations error:", error);
        fail(res, 500, "Failed to load conversations");
    }
};

// GET /api/messages/unread-count
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiver: req.userId, read: false });
        res.status(200).json({ success: true, count });
    } catch (error) {
        console.error("Unread count error:", error);
        fail(res, 500, "Failed to get unread count");
    }
};
