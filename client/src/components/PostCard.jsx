import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Trash2, Send } from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'
import Avatar from './Avatar'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'
import { card, inputClass } from '../lib/ui'

const HASHTAG = /(#\w+)/g

/**
 * Plain text with #hashtags highlighted. Built from React elements (not HTML strings), so
 * anything a user types is always displayed as text and can never run as markup.
 */
const renderContent = (text) =>
  text.split(HASHTAG).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="font-medium text-brand-700">
        {part}
      </span>
    ) : (
      part
    )
  )

const PostCard = ({ post, onDeleted, startOpen = false }) => {
  const api = useApi()
  const navigate = useNavigate()
  const { me } = useCurrentUser()

  const [likes, setLikes] = useState(post.likes || [])
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0)
  const [showComments, setShowComments] = useState(startOpen)
  const [comments, setComments] = useState(null) // null until loaded
  const [commentError, setCommentError] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)

  const liked = likes.includes(me._id)
  const isOwner = post.user?._id === me._id

  // Comments are loaded the first time the section is opened.
  useEffect(() => {
    if (!showComments || comments !== null) return
    let alive = true
    api
      .get(`/api/posts/${post._id}`)
      .then((data) => alive && setComments(data.post.comments || []))
      .catch(() => alive && setCommentError(true))
    return () => {
      alive = false
    }
  }, [api, post._id, showComments, comments])

  const toggleLike = async () => {
    const before = likes
    setLikes(liked ? likes.filter((id) => id !== me._id) : [...likes, me._id]) // instant feedback
    try {
      const data = await api.post(`/api/posts/${post._id}/like`)
      setLikes(data.likes)
    } catch (error) {
      setLikes(before)
      toast.error(error.message)
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    const text = commentText.trim()
    if (!text || sending) return

    setSending(true)
    try {
      const data = await api.post(`/api/posts/${post._id}/comment`, { text })
      setComments((list) => [...(list || []), data.comment])
      setCommentsCount(data.comments_count)
      setCommentText('')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await api.del(`/api/posts/${post._id}`)
      toast.success('Post deleted')
      onDeleted?.(post._id)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Linkly', url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied')
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Could not share this post')
    }
  }

  const images = post.image_urls || []

  return (
    <article className={`${card} w-full max-w-2xl space-y-4 p-4`}>
      {/* Author */}
      <div className="flex items-start justify-between gap-2">
        <div
          onClick={() => post.user && navigate(`/profile/${post.user._id}`)}
          className={`inline-flex items-center gap-3 ${post.user ? 'cursor-pointer' : ''}`}
        >
          <Avatar user={post.user} size={42} />
          <div>
            <p className="font-semibold leading-tight">{post.user?.full_name || 'Deleted user'}</p>
            <p className="text-sm text-stone-500">
              {post.user && <>@{post.user.username} · </>}
              {moment(post.createdAt).fromNow()}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            aria-label="Delete post"
            className="cursor-pointer rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-accent-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Text */}
      {post.content && <p className="text-[15px] leading-relaxed whitespace-pre-line text-stone-800">{renderContent(post.content)}</p>}

      {/* Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={images.length === 1 ? 'col-span-2' : ''}
            >
              <img
                src={url}
                alt=""
                loading="lazy"
                className={`w-full rounded-xl object-cover ${images.length === 1 ? 'max-h-[28rem]' : 'h-48'}`}
              />
            </a>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 border-t border-stone-200 pt-3 text-sm text-stone-600">
        <button
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? 'Unlike' : 'Like'}
          className="flex cursor-pointer items-center gap-1.5 transition hover:text-accent-600"
        >
          <Heart className={`h-[18px] w-[18px] ${liked ? 'fill-accent-500 text-accent-500' : ''}`} />
          <span>{likes.length}</span>
        </button>

        <button
          onClick={() => setShowComments((open) => !open)}
          aria-expanded={showComments}
          aria-label="Comments"
          className="flex cursor-pointer items-center gap-1.5 transition hover:text-brand-700"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
          <span>{commentsCount}</span>
        </button>

        <button onClick={handleShare} aria-label="Share" className="flex cursor-pointer items-center gap-1.5 transition hover:text-brand-700">
          <Share2 className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="space-y-3 border-t border-stone-100 pt-3">
          {comments === null && !commentError && <p className="text-sm text-stone-400">Loading comments…</p>}
          {commentError && <p className="text-sm text-accent-600">Couldn&apos;t load comments.</p>}

          {comments?.map((comment) => (
            <div key={comment._id} className="flex gap-2.5">
              <Avatar user={comment.user} size={30} />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-stone-100 px-3.5 py-2">
                <p className="text-sm">
                  {comment.user ? (
                    <Link to={`/profile/${comment.user._id}`} className="font-semibold hover:underline">
                      {comment.user.full_name}
                    </Link>
                  ) : (
                    <span className="font-semibold">Deleted user</span>
                  )}
                  <span className="ml-2 text-xs text-stone-400">{moment(comment.createdAt).fromNow()}</span>
                </p>
                <p className="text-sm break-words whitespace-pre-line text-stone-700">{comment.text}</p>
              </div>
            </div>
          ))}

          {comments?.length === 0 && <p className="text-sm text-stone-400">No comments yet. Be the first!</p>}

          <form onSubmit={submitComment} className="flex items-center gap-2">
            <Avatar user={me} size={30} />
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
              placeholder="Write a comment…"
              aria-label="Write a comment"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || sending}
              aria-label="Send comment"
              className="cursor-pointer rounded-xl bg-brand-600 p-2.5 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </article>
  )
}

export default PostCard
