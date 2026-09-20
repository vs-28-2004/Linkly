import Post from "../models/Post.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { clampInt, cleanText } from "../utils/text.js";

const AUTHOR_FIELDS = "full_name username profile_picture";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// Shared by every "list of posts" endpoint: newest first, paginated, authors attached.
const listPosts = async (filter, query) => {
    const limit = clampInt(query.limit, 20, 1, 50);
    const skip = clampInt(query.skip, 0, 0, 100000);

    // Fetch one extra row so we know whether there is another page.
    const rows = await Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .populate("user", AUTHOR_FIELDS);

    return { posts: rows.slice(0, limit), hasMore: rows.length > limit };
};

// POST /api/posts  (multipart: content?, images?[])
export const createPost = async (req, res) => {
    try {
        const content = cleanText(req.body?.content, 2000);
        const files = req.files || [];

        if (!content && files.length === 0) {
            return fail(res, 400, "Post must contain either text or images");
        }

        const imageUrls = await Promise.all(files.map((file) => uploadToCloudinary(file.buffer, "linkly/posts")));

        let postType = "text";
        if (imageUrls.length > 0) postType = content ? "text_with_image" : "image";

        const post = await Post.create({
            user: req.userId,
            content,
            image_urls: imageUrls,
            post_type: postType,
        });
        await post.populate("user", AUTHOR_FIELDS);

        res.status(201).json({ success: true, message: "Post created successfully", post });
    } catch (error) {
        console.error("Create post error:", error);
        fail(res, error.status || 500, error.status ? error.message : "Failed to create post");
    }
};

// GET /api/posts?feed=all|following&limit=20&skip=0
export const getAllPosts = async (req, res) => {
    try {
        const filter = {};

        if (req.query.feed === "following") {
            const me = await User.findById(req.userId).select("following").lean();
            filter.user = { $in: [req.userId, ...(me?.following || [])] };
        }

        res.status(200).json({ success: true, ...(await listPosts(filter, req.query)) });
    } catch (error) {
        console.error("Get all posts error:", error);
        fail(res, 500, "Failed to get posts");
    }
};

// GET /api/posts/user/:userId
export const getUserPosts = async (req, res) => {
    try {
        res.status(200).json({ success: true, ...(await listPosts({ user: req.params.userId }, req.query)) });
    } catch (error) {
        console.error("Get user posts error:", error);
        fail(res, 500, "Failed to get user posts");
    }
};

// GET /api/posts/liked/:userId — posts that user has liked
export const getLikedPosts = async (req, res) => {
    try {
        res.status(200).json({ success: true, ...(await listPosts({ likes: req.params.userId }, req.query)) });
    } catch (error) {
        console.error("Get liked posts error:", error);
        fail(res, 500, "Failed to get liked posts");
    }
};

// GET /api/posts/:postId  (with comment authors)
export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate("user", AUTHOR_FIELDS)
            .populate("comments.user", AUTHOR_FIELDS);

        if (!post) return fail(res, 404, "Post not found");

        res.status(200).json({ success: true, post });
    } catch (error) {
        console.error("Get post error:", error);
        fail(res, 500, "Failed to get post");
    }
};

// DELETE /api/posts/:postId  (owner only)
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).select("user");
        if (!post) return fail(res, 404, "Post not found");

        if (post.user !== req.userId) {
            return fail(res, 403, "You can only delete your own posts");
        }

        await post.deleteOne();

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error("Delete post error:", error);
        fail(res, 500, "Failed to delete post");
    }
};

// POST /api/posts/:postId/like — toggles. Each branch is a single atomic update, and the
// filter guarantees it only applies once, so double-clicks and races can't skew the count.
export const toggleLikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        let post = await Post.findOneAndUpdate(
            { _id: postId, likes: { $ne: userId } },
            { $addToSet: { likes: userId }, $inc: { likes_count: 1 } },
            { new: true }
        ).select("likes likes_count");
        let liked = true;

        if (!post) {
            post = await Post.findOneAndUpdate(
                { _id: postId, likes: userId },
                { $pull: { likes: userId }, $inc: { likes_count: -1 } },
                { new: true }
            ).select("likes likes_count");
            liked = false;
        }

        if (!post) return fail(res, 404, "Post not found");

        res.status(200).json({
            success: true,
            message: liked ? "Post liked" : "Post unliked",
            liked,
            likes: post.likes,
            likes_count: post.likes_count,
        });
    } catch (error) {
        console.error("Toggle like error:", error);
        fail(res, 500, "Failed to toggle like");
    }
};

// POST /api/posts/:postId/comment  { text }
export const addComment = async (req, res) => {
    try {
        const text = cleanText(req.body?.text, 500);
        if (!text) return fail(res, 400, "Comment text is required");

        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $push: { comments: { user: req.userId, text } }, $inc: { comments_count: 1 } },
            { new: true }
        );
        if (!post) return fail(res, 404, "Post not found");

        await post.populate("comments.user", AUTHOR_FIELDS);

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            comment: post.comments[post.comments.length - 1],
            comments_count: post.comments_count,
        });
    } catch (error) {
        console.error("Add comment error:", error);
        fail(res, 500, "Failed to add comment");
    }
};
