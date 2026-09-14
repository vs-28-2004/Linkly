import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

try {
    console.log("Cloudinary upload test started...");

    const result = await cloudinary.uploader.upload(
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        {
            folder: "pingup/test"
        }
    );

    console.log("UPLOAD SUCCESS");
    console.log(result.secure_url);

} catch (error) {
    console.log("UPLOAD FAILED");
    console.log("Message:", error.message);
    console.log("HTTP:", error.http_code);
    console.log("Error object:", error.error);
}