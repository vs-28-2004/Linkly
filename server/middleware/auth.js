import { getAuth } from "@clerk/express";
import { ensureUser } from "../utils/users.js";

/**
 * Requires a signed-in Clerk user (Bearer token or session cookie), exposes their id as
 * req.userId, and makes sure they have a Linkly profile so later queries never point at
 * a user that does not exist.
 */
const authMiddleware = async (req, res, next) => {
    try {
        const { userId } = getAuth(req) || {};

        if (!userId) {
            return res.status(401).json({ success: false, message: "Please sign in to continue" });
        }

        req.userId = userId;
        await ensureUser(userId);
        next();
    } catch (error) {
        next(error);
    }
};

export default authMiddleware;
