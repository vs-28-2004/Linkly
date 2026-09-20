import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import Avatar from './Avatar'
import StoryModal from './StoryModal'
import StoryViewer from './StoryViewer'
import { useApi } from '../lib/api'

/** The little preview tile shown for each story in the bar. */
const StoryPreview = ({ story }) => {
  if (story.media_type === 'image') {
    return <img src={story.media_url} alt="" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-90" />
  }
  if (story.media_type === 'video') {
    return <video src={story.media_url} muted preload="metadata" className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-90" />
  }
  return (
    <div className="flex h-full w-full items-center justify-center p-3" style={{ backgroundColor: story.background_color }}>
      <p className="line-clamp-4 text-center text-xs font-medium text-white">{story.content}</p>
    </div>
  )
}

const StoriesBar = () => {
  const api = useApi()
  const [stories, setStories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .get('/api/stories')
      .then((data) => alive && setStories(data.stories || []))
      .catch(() => {
        // Stories are a bonus; the feed still works if they fail to load.
      })
    return () => {
      alive = false
    }
  }, [api])

  return (
    <div className="no-scrollbar w-full overflow-x-auto px-4">
      <div className="flex gap-3 pb-1">
        {/* Add story */}
        <button
          onClick={() => setShowModal(true)}
          className="flex aspect-3/4 max-h-40 min-w-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-linear-to-b from-brand-50 to-white p-4 transition hover:shadow-md"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-accent-600">
            <Plus className="h-5 w-5 text-white" />
          </span>
          <span className="text-center text-sm font-semibold text-stone-700">Create Story</span>
        </button>

        {/* Stories */}
        {stories.map((story, index) => (
          <button
            key={story._id}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Story by ${story.user?.full_name || 'someone'}`}
            className="group relative aspect-3/4 max-h-40 min-w-28 cursor-pointer overflow-hidden rounded-2xl bg-stone-900 shadow transition hover:shadow-lg active:scale-95"
          >
            <div className="absolute inset-0">
              <StoryPreview story={story} />
            </div>
            <Avatar user={story.user} size={30} className="absolute top-2.5 left-2.5 z-10 ring-2 ring-white" />
            <p className="absolute right-2 bottom-1.5 z-10 text-[11px] font-medium text-white drop-shadow">{moment(story.createdAt).fromNow(true)}</p>
          </button>
        ))}
      </div>

      {showModal && (
        <StoryModal
          onClose={() => setShowModal(false)}
          onCreated={(story) => setStories((list) => [story, ...list])}
        />
      )}
      {currentIndex !== null && (
        <StoryViewer stories={stories} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} />
      )}
    </div>
  )
}

export default StoriesBar
