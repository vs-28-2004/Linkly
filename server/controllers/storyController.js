import Story from "../models/Story.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { cleanText } from "../utils/text.js";

const AUTHOR_FIELDS = "full_name username profile_picture";
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// POST /api/stories  (multipart: content?, background_color?, media?)
export const createStory = async (req, res) => {
    try {
        const content = cleanText(req.body?.content, 500);
        const file = req.file;

        if (!file && !content) return fail(res, 400, "Add some text or a photo/video to your story");

        let mediaType = "text";
        let mediaUrl = "";
        if (file) {
            mediaType = file.mimetype.startsWith("video/") ? "video" : "image";
            mediaUrl = await uploadToCloudinary(file.buffer, "linkly/stories", mediaType);
        }

        const story = await Story.create({
            user: req.userId,
            content,
            media_url: mediaUrl,
            media_type: mediaType,
            ...(COLOR_RE.test(req.body?.background_color || "") ? { background_color: req.body.background_color } : {}),
        });
        await story.populate("user", AUTHOR_FIELDS);

        res.status(201).json({ success: true, story });
    } catch (error) {
        console.error("Create story error:", error);
        fail(res, error.status || 500, error.status ? error.message : "Failed to create story");
    }
};

// GET /api/stories — live (not yet expired) stories from you and the people you follow
export const getStories = async (req, res) => {
    try {
        const me = await User.findById(req.userId).select("following").lean();
        const authors = [req.userId, ...(me?.following || [])];

        const stories = await Story.find({ user: { $in: authors }, expiresAt: { $gt: new Date() } })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("user", AUTHOR_FIELDS);

        res.status(200).json({ success: true, stories });
    } catch (error) {
        console.error("Get stories error:", error);
        fail(res, 500, "Failed to load stories");
    }
};

// POST /api/stories/:storyId/view — records that the signed-in user saw the story
export const viewStory = async (req, res) => {
    try {
        const story = await Story.findById(req.params.storyId).select("user");
        if (!story) return fail(res, 404, "Story not found");

        if (story.user !== req.userId) {
            await Story.updateOne({ _id: story._id }, { $addToSet: { views: req.userId } });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("View story error:", error);
        fail(res, 500, "Failed to record view");
    }
};
