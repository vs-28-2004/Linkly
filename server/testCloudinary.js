import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Testing Cloudinary...");
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key exists:", !!process.env.CLOUDINARY_API_KEY);
console.log("API secret exists:", !!process.env.CLOUDINARY_API_SECRET);

try {

    const result = await cloudinary.api.ping();

    console.log("Cloudinary connection SUCCESS:");
    console.log(result);

} catch (error) {

    console.error("Cloudinary connection FAILED:");
    console.error(error);

}