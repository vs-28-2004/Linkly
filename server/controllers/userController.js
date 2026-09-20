import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { CARD_FIELDS, ensureUser, toCard } from "../utils/users.js";
import { USERNAME_RE, cleanText, clampInt, escapeRegex } from "../utils/text.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });

/** Full profile shape. Email is only ever included for the owner. */
const toProfile = (doc, { withEmail = false } = {}) => {
    const u = typeof doc.toObject === "function" ? doc.toObject() : doc;
    return {
        _id: u._id,
        full_name: u.full_name,
        username: u.username,
        bio: u.bio,
        profile_picture: u.profile_picture,
        cover_photo: u.cover_photo,
        location: u.location,
        followers: u.followers || [],
        following: u.following || [],
        createdAt: u.createdAt,
        ...(withEmail ? { email: u.email } : {}),
    };
};

// POST /api/users/sync — create the profile on first sign-in, otherwise just return it.
// Never overwrites anything the user has edited.
export const syncUser = async (req, res) => {
    try {
        const user = await ensureUser(req.userId);
        res.status(200).json({ success: true, user: toProfile(user, { withEmail: true }) });
    } catch (error) {
        console.error("Sync user error:", error);
        fail(res, 500, "Failed to sync user");
    }
};

// GET /api/users/me
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return fail(res, 404, "User not found");
        res.status(200).json({ success: true, user: toProfile(user, { withEmail: true }) });
    } catch (error) {
        console.error("Get current user error:", error);
        fail(res, 500, "Failed to get current user");
    }
};

// GET /api/users/:userId
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return fail(res, 404, "User not found");
        res.status(200).json({ success: true, user: toProfile(user) });
    } catch (error) {
        console.error("Get user profile error:", error);
        fail(res, 500, "Failed to get user profile");
    }
};

// PUT /api/users/profile  (multipart: full_name?, username?, bio?, location?, profile_picture?, cover_photo?)
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { full_name, username, bio, location } = req.body ?? {};
        const update = {};

        if (full_name !== undefined) {
            const value = cleanText(full_name, 60);
            if (!value) return fail(res, 400, "Name can't be empty");
            update.full_name = value;
        }

        if (username !== undefined) {
            const value = String(username).trim().toLowerCase().replace(/^@/, "");
            if (!USERNAME_RE.test(value)) {
                return fail(res, 400, "Username must be 3-30 characters: letters, numbers, dots or underscores");
            }
            if (await User.exists({ username: value, _id: { $ne: userId } })) {
                return fail(res, 409, "That username is already taken");
            }
            update.username = value;
        }

        if (bio !== undefined) update.bio = cleanText(bio, 200);
        if (location !== undefined) update.location = cleanText(location, 60);

        const avatar = req.files?.profile_picture?.[0];
        const cover = req.files?.cover_photo?.[0];
        const [avatarUrl, coverUrl] = await Promise.all([
            avatar ? uploadToCloudinary(avatar.buffer, "linkly/profiles") : null,
            cover ? uploadToCloudinary(cover.buffer, "linkly/covers") : null,
        ]);
        if (avatarUrl) update.profile_picture = avatarUrl;
        if (coverUrl) update.cover_photo = coverUrl;

        const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true });
        if (!user) return fail(res, 404, "User not found");

        res.status(200).json({ success: true, message: "Profile updated", user: toProfile(user, { withEmail: true }) });
    } catch (error) {
        if (error?.code === 11000) return fail(res, 409, "That username is already taken");
        console.error("Update user profile error:", error);
        fail(res, error.status || 500, error.status ? error.message : "Failed to update profile");
    }
};

// GET /api/users/search?query=...
export const searchUsers = async (req, res) => {
    try {
        const query = String(req.query.query || "").trim().slice(0, 60);
        if (!query) return fail(res, 400, "Search query is required");

        const pattern = new RegExp(escapeRegex(query), "i");
        const users = await User.find({
            _id: { $ne: req.userId },
            $or: [{ full_name: pattern }, { username: pattern }, { bio: pattern }, { location: pattern }],
        })
            .select(CARD_FIELDS)
            .limit(20)
            .lean();

        res.status(200).json({ success: true, users: users.map(toCard) });
    } catch (error) {
        console.error("Search users error:", error);
        fail(res, 500, "Failed to search users");
    }
};

// GET /api/users/all?limit=20&exclude_following=1  — used by Discover and the "Suggested" card
export const getAllUsers = async (req, res) => {
    try {
        const limit = clampInt(req.query.limit, 20, 1, 50);
        const filter = { _id: { $ne: req.userId } };

        if (req.query.exclude_following === "1") {
            const me = await User.findById(req.userId).select("following").lean();
            filter._id = { $nin: [req.userId, ...(me?.following || [])] };
        }

        const users = await User.find(filter).select(CARD_FIELDS).sort({ createdAt: -1 }).limit(limit).lean();

        res.status(200).json({ success: true, users: users.map(toCard) });
    } catch (error) {
        console.error("Get all users error:", error);
        fail(res, 500, "Failed to get users");
    }
};
