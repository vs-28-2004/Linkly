import { clerkClient } from "@clerk/express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Story from "../models/Story.js";
import Message from "../models/Message.js";
import { slugifyUsername } from "./text.js";

// What other people are allowed to see on a user card (lists, search, chat header).
export const CARD_FIELDS = "full_name username profile_picture bio location followers";

/** Lean user doc -> the small public shape used in lists and search. */
export const toCard = (u) => ({
    _id: u._id,
    full_name: u.full_name,
    username: u.username,
    profile_picture: u.profile_picture,
    bio: u.bio,
    location: u.location,
    followers_count: Array.isArray(u.followers) ? u.followers.length : 0,
});

/** Find a username that is not taken yet, starting from `raw`. */
export const uniqueUsername = async (raw, seed = "") => {
    let base = slugifyUsername(raw);
    if (base.length < 3) {
        base = `user_${String(seed).slice(-6).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
    }

    let candidate = base;
    for (let i = 0; i < 10; i++) {
        if (!(await User.exists({ username: candidate }))) return candidate;
        candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return `${base}${Date.now().toString(36)}`;
};

const isDuplicateKey = (error) => error?.code === 11000;

/**
 * Creates a Linkly profile from Clerk account data. Never touches an existing profile,
 * so edits the user made inside Linkly are never overwritten.
 * Used by the sign-in bootstrap and by the Inngest webhook.
 */
export const createUserFromClerk = async ({ id, firstName, lastName, username, email, imageUrl }) => {
    const fullName =
        [firstName, lastName].filter(Boolean).join(" ").trim() ||
        username ||
        (email ? email.split("@")[0] : "") ||
        "Linkly User";

    for (let attempt = 0; attempt < 3; attempt++) {
        const handle = await uniqueUsername(username || (email ? email.split("@")[0] : ""), id);
        try {
            return await User.create({
                _id: id,
                email: email || "",
                full_name: fullName,
                username: handle,
                profile_picture: imageUrl || "",
            });
        } catch (error) {
            if (!isDuplicateKey(error)) throw error;
            // Either a parallel request already created this user (fine), or the username
            // was taken a millisecond ago (loop and try another one).
            const created = await User.findById(id);
            if (created) return created;
        }
    }

    throw new Error("Could not create your account. Please try again.");
};

/**
 * Returns the MongoDB user for a Clerk user id, creating it from Clerk data the first
 * time we see them. This is what makes the app work even if the Clerk -> Inngest
 * webhook is not configured (or is slow).
 */
export const ensureUser = async (userId) => {
    const existing = await User.findById(userId);
    if (existing) return existing;

    const clerkUser = await clerkClient.users.getUser(userId);
    const primary =
        clerkUser.emailAddresses?.find((e) => e.id === clerkUser.primaryEmailAddressId) ||
        clerkUser.emailAddresses?.[0];

    return createUserFromClerk({
        id: userId,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        email: primary?.emailAddress,
        imageUrl: clerkUser.imageUrl,
    });
};

/** Remove a user and everything that points at them (used when the Clerk account is deleted). */
export const deleteUserData = async (userId) => {
    await Promise.all([
        User.deleteOne({ _id: userId }),
        Post.deleteMany({ user: userId }),
        Story.deleteMany({ user: userId }),
        Message.deleteMany({ $or: [{ sender: userId }, { receiver: userId }] }),
        User.updateMany({ followers: userId }, { $pull: { followers: userId } }),
        User.updateMany({ following: userId }, { $pull: { following: userId } }),
    ]);
};
