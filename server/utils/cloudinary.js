import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (buffer, folder = "pingup/posts") => {
    return new Promise((resolve, reject) => {

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {

                if (error) {
                    console.error("========== CLOUDINARY UPLOAD ERROR ==========");
                    console.error(error);
                    console.error("==============================================");
                    return reject(error);
                }

                console.log("Cloudinary upload successful:");
                console.log(result.secure_url);

                resolve(result.secure_url);
            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(uploadStream);
    });
};

export default cloudinary;