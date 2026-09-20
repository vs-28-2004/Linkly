import express from "express";
import authMiddleware from "../middleware/auth.js";
import { uploadPostImages } from "../middleware/upload.js";
import { validateObjectId } from "../middleware/validate.js";
import {
    createPost,
    getAllPosts,
    getUserPosts,
    getLikedPosts,
    getPost,
    deletePost,
    toggleLikePost,
    addComment,
} from "../controllers/postController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", uploadPostImages, createPost);
router.get("/", getAllPosts);
router.get("/user/:userId", getUserPosts);
router.get("/liked/:userId", getLikedPosts);
router.get("/:postId", validateObjectId("postId"), getPost);
router.delete("/:postId", validateObjectId("postId"), deletePost);
router.post("/:postId/like", validateObjectId("postId"), toggleLikePost);
router.post("/:postId/comment", validateObjectId("postId"), addComment);

export default router;
