import express from "express";
import authMiddleware from "../middleware/auth.js";
import { uploadProfileImages } from "../middleware/upload.js";
import {
    syncUser,
    getCurrentUser,
    getUserProfile,
    updateUserProfile,
    searchUsers,
    getAllUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/sync", syncUser);
router.get("/me", getCurrentUser);
router.get("/search", searchUsers);
router.get("/all", getAllUsers);
router.put("/profile", uploadProfileImages, updateUserProfile);
router.get("/profile/:userId", getUserProfile); // older alias of /:userId
router.get("/:userId", getUserProfile);

export default router;
