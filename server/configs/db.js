import mongoose from "mongoose";

/**
 * Connects to MongoDB. Works with plain URIs and with Atlas URIs that already
 * carry a query string (?retryWrites=true...) because the database name is passed
 * as an option instead of being glued onto the URL.
 *
 * Data created before the rebrand lives in the "pingup" database, so that stays the
 * default. Set MONGODB_DB_NAME if you want a different one.
 */
const connectDB = async () => {
    const uri = process.env.MONGODB_URL;
    if (!uri) {
        throw new Error("MONGODB_URL is not set. Copy server/.env.example to server/.env and fill it in.");
    }
    const dbName = process.env.MONGODB_DB_NAME || "pingup";

    mongoose.connection.on("connected", () => console.log(`Database connected (${dbName})`));
    mongoose.connection.on("error", (error) => console.error("Database error:", error.message));

    await mongoose.connect(uri, { dbName });
};

export default connectDB;
