import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper } from 'lucide-react'
import toast from 'react-hot-toast'
import StoriesBar from '../components/StoriesBar'
import RecentMessages from '../components/RecentMessages'
import SuggestedUsers from '../components/SuggestedUsers'
import PostCard from '../components/PostCard'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { btnPrimary, btnSoft } from '../lib/ui'

const PAGE_SIZE = 10

const tabs = [
  { id: 'everyone', label: 'Everyone' },
  { id: 'following', label: 'Following' },
]

const Feed = () => {
  const api = useApi()
  const [tab, setTab] = useState('everyone')
  // `tab` records which feed the data belongs to, so switching tabs shows the spinner without
  // needing to reset state inside an effect.
  const [feed, setFeed] = useState({ tab: null, posts: [], hasMore: false, error: null })
  const [loadingMore, setLoadingMore] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const loading = feed.tab !== tab

  useEffect(() => {
    let alive = true
    api
      .get(`/api/posts?feed=${tab}&limit=${PAGE_SIZE}&skip=0`)
      .then((data) => alive && setFeed({ tab, posts: data.posts, hasMore: data.hasMore, error: null }))
      .catch((error) => alive && setFeed({ tab, posts: [], hasMore: false, error: error.message }))
    return () => {
      alive = false
    }
  }, [api, tab, reloadKey])

  const retry = () => {
    setFeed((f) => ({ ...f, tab: null })) // back to the spinner
    setReloadKey((k) => k + 1)
  }

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const data = await api.get(`/api/posts?feed=${tab}&limit=${PAGE_SIZE}&skip=${feed.posts.length}`)
      setFeed((f) => {
        const seen = new Set(f.posts.map((p) => p._id))
        return { ...f, posts: [...f.posts, ...data.posts.filter((p) => !seen.has(p._id))], hasMore: data.hasMore }
      })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const removePost = (id) => setFeed((f) => ({ ...f, posts: f.posts.filter((p) => p._id !== id) }))

  return (
    <div className="flex items-start justify-center py-6 sm:py-10 xl:gap-8 xl:pr-5">
      {/* Stories + posts */}
      <div className="w-full max-w-2xl min-w-0">
        <StoriesBar />

        <div className="mx-4 mt-6 inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-brand-600 text-white' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center space-y-5 p-4">
          {loading && <Loading height="30vh" />}

          {!loading && feed.error && (
            <EmptyState
              title="Couldn't load the feed"
              action={
                <button className={btnSoft} onClick={retry}>
                  Try again
                </button>
              }
            >
              {feed.error}
            </EmptyState>
          )}

          {!loading &&
            !feed.error &&
            feed.posts.map((post) => <PostCard key={post._id} post={post} onDeleted={removePost} />)}

          {!loading && !feed.error && feed.posts.length === 0 && (
            <EmptyState
              icon={Newspaper}
              title={tab === 'following' ? 'Nothing here yet' : 'No posts yet'}
              action={
                <Link to={tab === 'following' ? '/discover' : '/create-post'} className={btnPrimary}>
                  {tab === 'following' ? 'Find people to follow' : 'Write the first post'}
                </Link>
              }
            >
              {tab === 'following' ? 'Follow a few people and their posts will show up here.' : 'Be the first to share something.'}
            </EmptyState>
          )}

          {!loading && feed.hasMore && (
            <button onClick={loadMore} disabled={loadingMore} className={btnSoft}>
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="sticky top-6 space-y-4 max-xl:hidden">
        <RecentMessages />
        <SuggestedUsers />
      </div>
    </div>
  )
}

export default Feed
