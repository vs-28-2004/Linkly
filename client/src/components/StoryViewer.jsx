import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import Avatar from './Avatar'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'

const IMAGE_DURATION_MS = 10000

const StoryViewer = ({ stories, currentIndex, setCurrentIndex }) => {
  const api = useApi()
  const { me } = useCurrentUser()
  const story = stories[currentIndex]

  const close = () => setCurrentIndex(null)
  const next = () => (currentIndex < stories.length - 1 ? setCurrentIndex(currentIndex + 1) : close())
  const previous = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1)

  // Tell the server this story was seen (someone else's stories only; failures don't matter).
  const storyId = story?._id
  const ownerId = story?.user?._id
  useEffect(() => {
    if (!storyId || ownerId === me._id) return
    api.post(`/api/stories/${storyId}/view`).catch(() => {})
  }, [api, storyId, ownerId, me._id])

  // Escape closes the viewer
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setCurrentIndex(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setCurrentIndex])

  if (!story) return null

  const renderContent = () => {
    switch (story.media_type) {
      case 'image':
        return <img src={story.media_url} alt="story" className="h-full w-full object-contain" />
      case 'video':
        return <video onEnded={next} src={story.media_url} controls autoPlay className="h-full w-full object-contain" />
      default:
        return <div className="flex h-full w-full items-center justify-center p-8 text-center text-2xl font-medium text-white">{story.content}</div>
    }
  }

  return (
    <div
      className="fixed inset-0 z-110 flex h-screen items-center justify-center"
      style={{ backgroundColor: story.media_type === 'text' ? story.background_color : '#000' }}
      role="dialog"
      aria-label="Story"
    >
      {/* Progress bar (images and text auto-advance; videos advance when they end) */}
      {story.media_type !== 'video' && (
        <div className="absolute top-0 h-1 w-full bg-white/25">
          <div
            key={story._id}
            className="h-full origin-left bg-white"
            style={{ animation: `story-progress ${IMAGE_DURATION_MS}ms linear forwards` }}
            onAnimationEnd={next}
          />
        </div>
      )}

      {/* Author */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3 rounded-full bg-black/40 py-1.5 pr-4 pl-1.5 backdrop-blur-xl">
        <Avatar user={story.user} size={32} className="ring-2 ring-white" />
        <span className="text-sm font-semibold text-white">{story.user?.full_name}</span>
        {story.user?._id === me._id && <span className="text-xs text-white/70">{story.views?.length || 0} views</span>}
      </div>

      <button onClick={close} aria-label="Close story" className="absolute top-4 right-4 z-20 cursor-pointer text-white">
        <X className="h-8 w-8 transition hover:scale-110" />
      </button>

      <div className="relative flex h-full w-full items-center justify-center">
        {/* Tap left / right to go back / forward. Kept off the video controls (bottom strip). */}
        <div className="absolute top-0 bottom-16 left-0 z-10 w-1/2" onClick={previous} />
        <div className="absolute top-0 right-0 bottom-16 z-10 w-1/2" onClick={next} />
        {renderContent()}
      </div>

      {story.media_type !== 'text' && story.content && (
        <p className="absolute bottom-6 z-20 max-w-md rounded-xl bg-black/50 px-4 py-2 text-center text-sm text-white backdrop-blur">{story.content}</p>
      )}
    </div>
  )
}

export default StoryViewer
