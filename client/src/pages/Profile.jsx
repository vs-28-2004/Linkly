import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import moment from 'moment'
import UserProfileInfo from '../components/UserProfileInfo'
import ProfileModal from '../components/ProfileModal'
import PostCard from '../components/PostCard'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'
import { card } from '../lib/ui'

const TABS = ['posts', 'media', 'likes']

const Profile = () => {
  const { profileId } = useParams()
  const api = useApi()
  const navigate = useNavigate()
  const { me, setMe, follow, unfollow } = useCurrentUser()

  // Own profile when there is no id in the URL (or it is our own id)
  const userId = profileId || me._id
  const isOwn = userId === me._id

  // `userId` records which profile the data belongs to, so switching profiles shows the spinner.
  const [data, setData] = useState({ userId: null, user: null, posts: [], error: null })
  const [likedState, setLikedState] = useState({ userId: null, posts: [] })
  const [activeTab, setActiveTab] = useState('posts')
  const [showEdit, setShowEdit] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    let alive = true
    Promise.all([api.get(`/api/users/${userId}`), api.get(`/api/posts/user/${userId}?limit=50`)])
      .then(([u, p]) => alive && setData({ userId, user: u.user, posts: p.posts, error: null }))
      .catch((error) => alive && setData({ userId, user: null, posts: [], error: error.message }))
    return () => {
      alive = false
    }
  }, [api, userId])

  // Liked posts are only fetched when that tab is opened
  useEffect(() => {
    if (activeTab !== 'likes') return
    let alive = true
    api
      .get(`/api/posts/liked/${userId}?limit=50`)
      .then((r) => alive && setLikedState({ userId, posts: r.posts }))
      .catch((error) => {
        if (alive) {
          toast.error(error.message)
          setLikedState({ userId, posts: [] })
        }
      })
    return () => {
      alive = false
    }
  }, [api, userId, activeTab])

  if (data.userId !== userId) return <Loading />

  if (!data.user) {
    return (
      <div className="p-6">
        <EmptyState title="User not found">{data.error || 'This profile does not exist.'}</EmptyState>
      </div>
    )
  }

  const { user, posts } = data
  const isFollowing = me.following.includes(userId)

  const toggleFollow = async () => {
    setFollowBusy(true)
    try {
      await (isFollowing ? unfollow(userId) : follow(userId))
      setData((d) => ({
        ...d,
        user: {
          ...d.user,
          followers: isFollowing ? d.user.followers.filter((id) => id !== me._id) : [...new Set([...d.user.followers, me._id])],
        },
      }))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setFollowBusy(false)
    }
  }

  const handleSaved = (updated) => {
    setMe((m) => ({ ...m, ...updated }))
    setData((d) => ({ ...d, user: { ...d.user, ...updated } }))
    setShowEdit(false)
  }

  const removePost = (id) => setData((d) => ({ ...d, posts: d.posts.filter((p) => p._id !== id) }))

  const likedLoading = likedState.userId !== userId
  const mediaPosts = posts.filter((post) => post.image_urls?.length > 0)

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        {/* Profile card */}
        <div className={`${card} overflow-hidden`}>
          <div className="h-40 bg-linear-to-r from-brand-200 via-accent-100 to-brand-100 md:h-56">
            {user.cover_photo && <img src={user.cover_photo} alt="" className="h-full w-full object-cover" />}
          </div>

          <UserProfileInfo
            user={user}
            postsCount={posts.length}
            isOwn={isOwn}
            isFollowing={isFollowing}
            followBusy={followBusy}
            onEdit={() => setShowEdit(true)}
            onToggleFollow={toggleFollow}
            onMessage={() => navigate(`/messages/${userId}`)}
          />
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className={`${card} mx-auto flex max-w-md p-1`} role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 cursor-pointer rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab ? 'bg-brand-600 text-white' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'posts' && (
            <div className="mt-6 flex flex-col items-center gap-5">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post._id} post={post} onDeleted={removePost} />)
              ) : (
                <EmptyState title="No posts yet">{isOwn ? 'Your posts will show up here.' : `${user.full_name} hasn't posted anything yet.`}</EmptyState>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <div className="mt-6 flex flex-wrap gap-1">
              {mediaPosts.length === 0 && <div className="w-full"><EmptyState title="No photos yet" /></div>}
              {mediaPosts.map((post) =>
                post.image_urls.map((image, index) => (
                  <a key={`${post._id}-${index}`} href={image} target="_blank" rel="noopener noreferrer" className="group relative">
                    <img src={image} alt="" loading="lazy" className="aspect-video w-64 rounded-lg object-cover" />
                    <p className="absolute right-0 bottom-0 rounded-tl-lg bg-black/40 p-1 px-3 text-xs text-white opacity-0 backdrop-blur-xl transition duration-300 group-hover:opacity-100">
                      Posted {moment(post.createdAt).fromNow()}
                    </p>
                  </a>
                ))
              )}
            </div>
          )}

          {activeTab === 'likes' && (
            <div className="mt-6 flex flex-col items-center gap-5">
              {likedLoading && <Loading height="20vh" />}
              {!likedLoading && likedState.posts.length === 0 && <EmptyState title="No liked posts yet" />}
              {!likedLoading && likedState.posts.map((post) => <PostCard key={post._id} post={post} />)}
            </div>
          )}
        </div>
      </div>

      {showEdit && <ProfileModal user={user} onClose={() => setShowEdit(false)} onSaved={handleSaved} />}
    </div>
  )
}

export default Profile
