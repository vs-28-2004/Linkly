import express from "express";
import authMiddleware from "../middleware/auth.js";
import { uploadMessageImage } from "../middleware/upload.js";
import {
    sendMessage,
    getConversation,
    getConversations,
    getUnreadCount,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", uploadMessageImage, sendMessage);
router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.get("/conversation/:userId", getConversation);

export default router;
