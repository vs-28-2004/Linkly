import React, { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { dummyUserData } from "../assets/assets";
import { X, Image } from "lucide-react";
import toast from "react-hot-toast";

const CreatePost = () => {
  const { getToken } = useAuth();

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = dummyUserData;

  const handleSubmit = async () => {
    // Check if post is empty
    if (!content.trim() && images.length === 0) {
      throw new Error("Please add some text or an image");
    }

    try {
      setLoading(true);

      // Get Clerk authentication token
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Create FormData
      const formData = new FormData();

      // Add text
      if (content.trim()) {
        formData.append("content", content.trim());
      }

      // Add images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Send request to backend
      const response = await fetch(
        "http://localhost:4000/api/posts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      // Handle backend error
      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create post"
        );
      }

      // Clear form
      setContent("");
      setImages([]);

      return data;

    } catch (error) {
      console.error("Create post error:", error);
      throw error;

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Post
          </h1>

          <p className="text-slate-600">
            Share your thoughts with the world
          </p>
        </div>

        {/* Post Box */}
        <div className="max-w-xl bg-white p-4 sm:pb-3 rounded-xl shadow-md space-y-4">

          {/* User */}
          <div className="flex items-center gap-3">
            <img
              src={user.profile_picture}
              alt=""
              className="w-12 h-12 rounded-full shadow"
            />

            <div>
              <h2 className="font-semibold">
                {user.full_name}
              </h2>

              <p className="text-sm text-gray-500">
                @{user.username}
              </p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            className="w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400"
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Selected Images */}
          {images.map((image, i) => (
            <div
              key={i}
              className="relative group"
            >
              <img
                src={URL.createObjectURL(image)}
                className="h-20 rounded-md"
                alt=""
              />

              <div
                onClick={() =>
                  setImages(
                    images.filter(
                      (_, index) => index !== i
                    )
                  )
                }
                className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="max-w-xl flex items-center justify-between pt-3 border-t border-gray-300">

          {/* Image Upload */}
          <label
            htmlFor="images"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
          >
            <Image className="size-6" />
          </label>

          <input
            type="file"
            id="images"
            accept="image/*"
            hidden
            multiple
            onChange={(e) => {
              if (e.target.files) {
                setImages([
                  ...images,
                  ...Array.from(e.target.files),
                ]);
              }
            }}
          />

          {/* Publish Button */}
          <button
            disabled={loading}
            onClick={() =>
              toast.promise(
                handleSubmit(),
                {
                  loading: "Uploading...",
                  success: "Post Added",
                  error: (error) =>
                    error.message ||
                    "Post Not Added",
                }
              )
            }
            className="text-sm bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Publishing..."
              : "Publish Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;