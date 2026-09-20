import express from "express";
import authMiddleware from "../middleware/auth.js";
import { uploadStoryMedia } from "../middleware/upload.js";
import { validateObjectId } from "../middleware/validate.js";
import { createStory, getStories, viewStory } from "../controllers/storyController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", uploadStoryMedia, createStory);
router.get("/", getStories);
router.post("/:storyId/view", validateObjectId("storyId"), viewStory);

export default router;
