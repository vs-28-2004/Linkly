// One-off helper: profiles created before the rebrand still have the old default bio.
// Run once from the /server folder:  npm run migrate:branding
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGODB_URL, { dbName: process.env.MONGODB_DB_NAME || "pingup" });

const result = await User.updateMany(
    { bio: "Hey there! I am using PingUp." },
    { $set: { bio: "Hey there! I am using Linkly." } }
);

console.log(`Updated ${result.modifiedCount} bio(s).`);
await mongoose.disconnect();
