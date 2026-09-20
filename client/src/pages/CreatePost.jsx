import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '../components/Avatar'
import { useApi } from '../lib/api'
import { useObjectUrl } from '../lib/useObjectUrl'
import { useCurrentUser } from '../context/useCurrentUser'
import { btnPrimary, card, pageWrap } from '../lib/ui'

const MAX_IMAGES = 4
const MAX_MB = 8
const MAX_CHARS = 2000

const ImagePreview = ({ file, onRemove }) => {
  const url = useObjectUrl(file)
  return (
    <div className="group relative">
      <img src={url} className="h-24 w-24 rounded-xl object-cover" alt="" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute -top-2 -right-2 cursor-pointer rounded-full bg-stone-900 p-1 text-white shadow transition hover:bg-accent-600"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

const CreatePost = () => {
  const api = useApi()
  const navigate = useNavigate()
  const { me } = useCurrentUser()

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const addImages = (e) => {
    const picked = Array.from(e.target.files || [])
    e.target.value = '' // lets the same file be picked again

    const tooBig = picked.find((file) => file.size > MAX_MB * 1024 * 1024)
    if (tooBig) return toast.error(`"${tooBig.name}" is larger than ${MAX_MB} MB`)

    const combined = [...images, ...picked]
    if (combined.length > MAX_IMAGES) toast.error(`You can add up to ${MAX_IMAGES} images`)
    setImages(combined.slice(0, MAX_IMAGES))
  }

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      throw new Error('Please add some text or an image')
    }

    setLoading(true)
    try {
      const form = new FormData()
      if (content.trim()) form.append('content', content.trim())
      images.forEach((image) => form.append('images', image))

      await api.post('/api/posts', form)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={pageWrap}>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Create post</h1>
        <p className="text-stone-500">Share something with your followers</p>
      </div>

      <div className={`${card} max-w-xl space-y-4 p-4 sm:p-5`}>
        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar user={me} size={46} className="shadow" />
          <div>
            <h2 className="font-semibold">{me.full_name}</h2>
            <p className="text-sm text-stone-500">@{me.username}</p>
          </div>
        </div>

        {/* Text */}
        <textarea
          className="min-h-28 w-full resize-none text-[15px] outline-none placeholder:text-stone-400"
          placeholder="What's happening?"
          maxLength={MAX_CHARS}
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />

        {/* Selected images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((image, i) => (
              <ImagePreview key={`${image.name}-${image.lastModified}-${i}`} file={image} onRemove={() => setImages(images.filter((_, index) => index !== i))} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-stone-200 pt-3">
          <div className="flex items-center gap-3">
            <label
              htmlFor="images"
              className="flex cursor-pointer items-center gap-2 rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-brand-700"
              aria-label="Add images"
            >
              <ImageIcon className="size-6" />
            </label>
            <input type="file" id="images" accept="image/*" hidden multiple onChange={addImages} />
            <span className="text-xs text-stone-400">
              {images.length}/{MAX_IMAGES} images · {content.length}/{MAX_CHARS}
            </span>
          </div>

          <button
            disabled={loading}
            onClick={() =>
              toast.promise(handleSubmit(), {
                loading: 'Publishing...',
                success: 'Post published',
                error: (error) => error.message || 'Post not published',
              })
            }
            className={`${btnPrimary} px-7`}
          >
            {loading ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
