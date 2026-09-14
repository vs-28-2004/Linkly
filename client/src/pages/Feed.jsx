import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import StoriesBar from "../components/StoriesBar";
import RecentMessages from "../components/RecentMessages";
import PostCard from "../components/PostCard";
import Loading from "../components/Loading";
import toast from "react-hot-toast";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:4000/api/posts"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch posts"
        );
      }

      // Backend returns { success: true, posts: [...] }
      setFeeds(data.posts || []);

    } catch (error) {
      console.error("Fetch posts error:", error);
      toast.error(error.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">

      {/* Stories and post list */}
      <div>
        <StoriesBar />

        <div className="p-4 space-y-6">

          {feeds.length > 0 ? (
            feeds.map((post) => (
              <PostCard
                key={post._id}
                post={post}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No posts yet.
            </div>
          )}

        </div>
      </div>

      {/* Right sidebar */}
      <div className="max-xl:hidden sticky top-0 space-y-4">

        <RecentMessages />

        <div className="max-h-64 bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">

          <h3 className="text-slate-800 font-semibold">
            Sponsored
          </h3>

          <img
            src={assets.sponsored_img}
            className="w-full h-auto rounded-md"
            alt=""
          />

          <p className="text-slate-600">
            Email marketing
          </p>

          <p className="text-slate-400">
            Supercharge your marketing with a powerful,
            easy-to-use platform built for results.
          </p>

        </div>
      </div>
    </div>
  );
};

export default Feed;