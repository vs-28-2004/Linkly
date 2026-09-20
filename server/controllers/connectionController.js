import User from "../models/User.js";
import { CARD_FIELDS, toCard } from "../utils/users.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

// POST /api/connections/follow/:userId  (idempotent)
export const followUser = async (req, res) => {
    try {
        const me = req.userId;
        const target = req.params.userId;

        if (me === target) return fail(res, 400, "You cannot follow yourself");
        if (!(await User.exists({ _id: target }))) return fail(res, 404, "User not found");

        await Promise.all([
            User.updateOne({ _id: me }, { $addToSet: { following: target } }),
            User.updateOne({ _id: target }, { $addToSet: { followers: me } }),
        ]);

        res.status(200).json({ success: true, message: "User followed successfully" });
    } catch (error) {
        console.error("Follow user error:", error);
        fail(res, 500, "Failed to follow user");
    }
};

// DELETE /api/connections/unfollow/:userId  (idempotent)
export const unfollowUser = async (req, res) => {
    try {
        const me = req.userId;
        const target = req.params.userId;

        if (me === target) return fail(res, 400, "Invalid operation");

        await Promise.all([
            User.updateOne({ _id: me }, { $pull: { following: target } }),
            User.updateOne({ _id: target }, { $pull: { followers: me } }),
        ]);

        res.status(200).json({ success: true, message: "User unfollowed successfully" });
    } catch (error) {
        console.error("Unfollow user error:", error);
        fail(res, 500, "Failed to unfollow user");
    }
};

// Loads the users behind a list of ids, as public cards.
const cardsFor = async (ids) => {
    if (!ids.length) return [];
    const users = await User.find({ _id: { $in: ids } }).select(CARD_FIELDS).lean();
    return users.map(toCard);
};

// GET /api/connections/followers/:userId
export const getFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("followers").lean();
        if (!user) return fail(res, 404, "User not found");
        res.status(200).json({ success: true, followers: await cardsFor(user.followers) });
    } catch (error) {
        console.error("Get followers error:", error);
        fail(res, 500, "Failed to get followers");
    }
};

// GET /api/connections/following/:userId
export const getFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("following").lean();
        if (!user) return fail(res, 404, "User not found");
        res.status(200).json({ success: true, following: await cardsFor(user.following) });
    } catch (error) {
        console.error("Get following error:", error);
        fail(res, 500, "Failed to get following");
    }
};

// GET /api/connections — connections are mutual follows (you follow them AND they follow you)
export const getConnections = async (req, res) => {
    try {
        const me = await User.findById(req.userId).select("following followers").lean();
        if (!me) return fail(res, 404, "User not found");

        const mutual = me.following.filter((id) => me.followers.includes(id));
        res.status(200).json({ success: true, connections: await cardsFor(mutual) });
    } catch (error) {
        console.error("Get connections error:", error);
        fail(res, 500, "Failed to get connections");
    }
};

// GET /api/connections/pending — people who follow you but you don't follow back yet.
// Following them back turns the pair into a connection.
export const getPending = async (req, res) => {
    try {
        const me = await User.findById(req.userId).select("following followers").lean();
        if (!me) return fail(res, 404, "User not found");

        const pending = me.followers.filter((id) => !me.following.includes(id));
        res.status(200).json({ success: true, pending: await cardsFor(pending) });
    } catch (error) {
        console.error("Get pending error:", error);
        fail(res, 500, "Failed to get pending connections");
    }
};
