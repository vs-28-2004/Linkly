import express from "express";
import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/User.js";

const router = express.Router();

// Create/sync current Clerk user into MongoDB
router.post("/sync", async (req, res) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Get user from Clerk
        const clerkUser = await clerkClient.users.getUser(userId);

        const email =
            clerkUser.emailAddresses?.[0]?.emailAddress || "";

        const fullName =
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "User";

        // Make username unique
        const username =
            clerkUser.username ||
            email.split("@")[0] ||
            `user_${userId.slice(-6)}`;

        const profilePicture =
            clerkUser.imageUrl || "";

        const user = await User.findOneAndUpdate(
            { _id: userId },
            {
                _id: userId,
                email: email,
                full_name: fullName,
                username: username,
                profile_picture: profilePicture,
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("User sync error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Get user profile
router.get("/profile/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json(user);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Update user profile
router.put("/profile", async (req, res) => {
    try {
        const { userId, ...updates } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        );

        res.json(user);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Follow user
router.post("/follow/:userId", async (req, res) => {
    try {
        const userId = req.body.userId;
        const targetUserId = req.params.userId;

        await User.findByIdAndUpdate(
            userId,
            { $addToSet: { following: targetUserId } }
        );

        await User.findByIdAndUpdate(
            targetUserId,
            { $addToSet: { followers: userId } }
        );

        res.json({
            success: true,
            message: "Followed successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Unfollow user
router.post("/unfollow/:userId", async (req, res) => {
    try {
        const userId = req.body.userId;
        const targetUserId = req.params.userId;

        await User.findByIdAndUpdate(
            userId,
            { $pull: { following: targetUserId } }
        );

        await User.findByIdAndUpdate(
            targetUserId,
            { $pull: { followers: userId } }
        );

        res.json({
            success: true,
            message: "Unfollowed successfully",
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Get followers
router.get("/followers/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate(
                "followers",
                "username full_name profile_picture"
            );

        res.json(user?.followers || []);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// Get following
router.get("/following/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate(
                "following",
                "username full_name profile_picture"
            );

        res.json(user?.following || []);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

export default router;