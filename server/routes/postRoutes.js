// import express from 'express';
// import Post from '../models/Post.js';
// import Comment from '../models/Comment.js';
// import authMiddleware from '../middleware/auth.js';

// const router = express.Router();

// // Create post
// router.post('/', async (req, res) => {
//     try {
//         const { content, image, userId } = req.body;
//         const post = new Post({ user: userId, content, image });
//         await post.save();
//         res.status(201).json(post);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get all posts (feed)
// router.get('/', async (req, res) => {
//     try {
//         const posts = await Post.find().populate('user', 'username full_name profile_picture').sort({ createdAt: -1 });
//         res.json(posts);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get posts by user
// router.get('/user/:userId', async (req, res) => {
//     try {
//         const posts = await Post.find({ user: req.params.userId }).populate('user', 'username full_name profile_picture').sort({ createdAt: -1 });
//         res.json(posts);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Like post
// router.post('/:postId/like', async (req, res) => {
//     try {
//         const userId = req.body.userId;
//         const post = await Post.findById(req.params.postId);
//         if (!post.likes.includes(userId)) {
//             post.likes.push(userId);
//             await post.save();
//         }
//         res.json({ message: 'Liked' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Unlike post
// router.post('/:postId/unlike', async (req, res) => {
//     try {
//         const userId = req.body.userId;
//         const post = await Post.findById(req.params.postId);
//         post.likes = post.likes.filter(id => id !== userId);
//         await post.save();
//         res.json({ message: 'Unliked' });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Add comment
// router.post('/:postId/comment', async (req, res) => {
//     try {
//         const { content, userId } = req.body;
//         const comment = new Comment({ user: userId, post: req.params.postId, content });
//         await comment.save();
//         await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment._id } });
//         res.status(201).json(comment);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// // Get comments for post
// router.get('/:postId/comments', async (req, res) => {
//     try {
//         const comments = await Comment.find({ post: req.params.postId }).populate('user', 'username full_name profile_picture').sort({ createdAt: -1 });
//         res.json(comments);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

// export default router;


import express from 'express';
import multer from 'multer';

import {
    createPost,
    getAllPosts,
    getUserPosts,
    getPost,
    deletePost,
    toggleLikePost,
    addComment
} from '../controllers/postController.js';

import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Create post
router.post(
    '/',
    authMiddleware,
    upload.array('images', 10),
    createPost
);

// Get all posts
router.get('/', getAllPosts);

// Get posts by user
router.get('/user/:userId', getUserPosts);

// Get single post
router.get('/:postId', getPost);

// Delete post
router.delete('/:postId', authMiddleware, deletePost);

// Like / Unlike
router.post('/:postId/like', authMiddleware, toggleLikePost);

// Add comment
router.post('/:postId/comment', authMiddleware, addComment);

export default router;
