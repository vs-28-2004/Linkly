import multer from "multer";

const MB = 1024 * 1024;

const reject = (message) => {
    const err = new Error(message);
    err.status = 400;
    return err;
};

const imagesOnly = (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(reject("Only image files are allowed"));

const imagesOrVideos = (req, file, cb) =>
    file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")
        ? cb(null, true)
        : cb(reject("Only image or video files are allowed"));

const storage = multer.memoryStorage();

// Posts: up to 4 images, 8 MB each
export const uploadPostImages = multer({
    storage,
    fileFilter: imagesOnly,
    limits: { fileSize: 8 * MB, files: 4 },
}).array("images", 4);

// Profile: one avatar + one cover, 5 MB each
export const uploadProfileImages = multer({
    storage,
    fileFilter: imagesOnly,
    limits: { fileSize: 5 * MB, files: 2 },
}).fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "cover_photo", maxCount: 1 },
]);

// Chat: one image, 5 MB
export const uploadMessageImage = multer({
    storage,
    fileFilter: imagesOnly,
    limits: { fileSize: 5 * MB, files: 1 },
}).single("image");

// Stories: one image or short video, 30 MB
export const uploadStoryMedia = multer({
    storage,
    fileFilter: imagesOrVideos,
    limits: { fileSize: 30 * MB, files: 1 },
}).single("media");
