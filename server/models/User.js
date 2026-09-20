import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, // Clerk user id
        email: { type: String, default: "" },
        full_name: { type: String, required: true, trim: true, maxlength: 60 },
        username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
        bio: { type: String, default: "Hey there! I am using Linkly.", maxlength: 200 },
        profile_picture: { type: String, default: "" },
        cover_photo: { type: String, default: "" },
        location: { type: String, default: "", maxlength: 60 },
        followers: [{ type: String, ref: "User" }],
        following: [{ type: String, ref: "User" }],
        // "Connections" are mutual follows and are derived at read time, so there is no stored array.
    },
    { timestamps: true, minimize: false }
);

const User = mongoose.model("User", userSchema);

export default User;
