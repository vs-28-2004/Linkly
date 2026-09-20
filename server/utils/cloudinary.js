import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an in-memory file to Cloudinary and resolves with its https URL.
 * `resourceType` is "image" (default) or "video".
 */
export const uploadToCloudinary = (buffer, folder = "linkly/posts", resourceType = "image") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error.message || error);
                    const failure = new Error("Upload failed. Please try again.");
                    failure.status = 502;
                    return reject(failure);
                }
                resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

export default cloudinary;
