import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getConnections,
    getPending,
} from "../controllers/connectionController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/follow/:userId", followUser);
router.delete("/unfollow/:userId", unfollowUser);
router.get("/followers/:userId", getFollowers);
router.get("/following/:userId", getFollowing);
router.get("/pending", getPending);
router.get("/", getConnections);

export default router;
