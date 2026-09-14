import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import UserProfileInfo from "../components/UserProfileInfo";
import ProfileModal from "../components/ProfileModal";
import PostCard from "../components/PostCard";
import Loading from "../components/Loading";
import moment from "moment";
import toast from "react-hot-toast";

const Profile = () => {
  const { profileId } = useParams();

  // Clerk
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();

  // State
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // If profileId exists -> another user's profile
  // Otherwise -> logged-in user's profile
  const userId = profileId || clerkUser?.id;

  // =========================
  // Sync Clerk User to MongoDB
  // =========================
  const syncUser = async () => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "http://localhost:4000/api/users/sync",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to sync user"
        );
      }

      return data.user;
    } catch (error) {
      console.error("User sync error:", error);
      throw error;
    }
  };

  // =========================
  // Fetch Profile
  // =========================
  const fetchProfile = async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);

      /*
       * If this is our own profile,
       * make sure the Clerk user exists in MongoDB.
       */
      if (!profileId) {
        await syncUser();
      }

      // =========================
      // Get User Profile
      // =========================
      const userResponse = await fetch(
        `http://localhost:4000/api/users/profile/${userId}`
      );

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        throw new Error(
          userData.message || "Failed to fetch user"
        );
      }

      setUser(userData);

      // =========================
      // Get User Posts
      // =========================
      const postsResponse = await fetch(
        `http://localhost:4000/api/posts/user/${userId}`
      );

      const postsData = await postsResponse.json();

      if (!postsResponse.ok) {
        throw new Error(
          postsData.message || "Failed to fetch posts"
        );
      }

      setPosts(postsData.posts || []);

    } catch (error) {
      console.error("Profile fetch error:", error);

      toast.error(
        error.message || "Failed to load profile"
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Load Profile
  // =========================
  useEffect(() => {
    if (isLoaded && userId) {
      fetchProfile();
    }
  }, [isLoaded, userId]);

  // Clerk loading
  if (!isLoaded) {
    return <Loading />;
  }

  // API loading
  if (loading) {
    return <Loading />;
  }

  // User not found
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        User not found
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-scroll bg-gray-50 p-6">

      <div className="max-w-3xl mx-auto">

        {/* =========================
                    Profile Card
                ========================= */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">

          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-linear-to-b from-indigo-200 via-purple-200 to-pink-200">

            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt=""
                className="w-full h-full object-cover"
              />
            )}

          </div>

          {/* User Information */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={userId}
            setShowEdit={setShowEdit}
          />

        </div>

        {/* =========================
                    Tabs
                ========================= */}
        <div className="mt-6">

          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto">

            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {tab.charAt(0).toUpperCase() +
                  tab.slice(1)}
              </button>
            ))}

          </div>

          {/* =========================
                        Posts
                    ========================= */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">

              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow p-6 text-gray-500">
                  No posts yet.
                </div>
              )}

            </div>
          )}

          {/* =========================
                        Media
                    ========================= */}
          {activeTab === "media" && (
            <div className="flex flex-wrap mt-6 max-w-6xl">

              {posts
                .filter(
                  (post) =>
                    post.image_urls &&
                    post.image_urls.length > 0
                )
                .map((post) => (
                  <React.Fragment key={post._id}>

                    {post.image_urls.map(
                      (image, index) => (
                        <Link
                          key={index}
                          target="_blank"
                          to={image}
                          className="relative group"
                        >
                          <img
                            src={image}
                            className="w-64 aspect-video object-cover"
                            alt=""
                          />

                          <p className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300">
                            Posted{" "}
                            {moment(
                              post.createdAt
                            ).fromNow()}
                          </p>
                        </Link>
                      )
                    )}

                  </React.Fragment>
                ))}

            </div>
          )}

          {/* =========================
                        Likes
                    ========================= */}
          {activeTab === "likes" && (
            <div className="mt-6 flex justify-center">
              <p className="text-gray-500">
                Liked posts will appear here.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* =========================
                Edit Profile Modal
            ========================= */}
      {showEdit && (
        <ProfileModal
          setShowEdit={setShowEdit}
        />
      )}

    </div>
  );
};

export default Profile;