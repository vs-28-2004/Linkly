import "dotenv/config"; // must stay first so env vars exist before other modules read them
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import connectDB from "./configs/db.js";
import { functions, inngest } from "./inngest/index.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Helpful warnings instead of mysterious 500s later.
const missing = (names) => names.filter((name) => !process.env[name]);
const noClerk = missing(["CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"]);
if (noClerk.length) console.warn(`Missing ${noClerk.join(", ")} - sign-in will not work until they are set.`);
const noCloudinary = missing(["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]);
if (noCloudinary.length) console.warn(`Missing ${noCloudinary.join(", ")} - image/video uploads will fail.`);

// CLIENT_URL is a comma-separated list of allowed front-end origins. Empty = allow any (fine for local dev).
const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/connections", connectionRoutes);

// Unknown API routes get JSON, never the front-end's index.html.
app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// If the client has been built (npm run build), serve it from here too.
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(path.join(clientDist, "index.html"))) {
    app.use(express.static(clientDist));
    app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
    app.get("/", (req, res) => res.send("Linkly API is running"));
}

// Error handler (must be last)
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    let status = err.status || 500;
    let message = status >= 500 ? "Internal server error" : err.message;

    if (err.name === "MulterError") {
        status = 400;
        message =
            err.code === "LIMIT_FILE_SIZE"
                ? "That file is too large"
                : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
                  ? "Too many files"
                  : err.message;
    }

    if (status >= 500) console.error("Error:", err);
    res.status(status).json({ success: false, message });
});

const PORT = process.env.PORT || 4000;

try {
    await connectDB();
} catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    process.exit(1);
}

app.listen(PORT, () => console.log(`Linkly server is running on port ${PORT}`));
