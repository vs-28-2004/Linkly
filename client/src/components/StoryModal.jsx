import React, { useState } from 'react'
import { ArrowLeft, Sparkle, Upload, TextIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useApi } from '../lib/api'
import { useObjectUrl } from '../lib/useObjectUrl'
import { useCurrentUser } from '../context/useCurrentUser'

const BG_COLORS = ['#cf3f09', '#be1f6b', '#7c3aed', '#4f46e5', '#ca8a04', '#0d9448']
const MAX_MB = 30

const StoryModal = ({ onClose, onCreated }) => {
  const api = useApi()
  const { me } = useCurrentUser()

  const [mode, setMode] = useState('text')
  const [background, setBackground] = useState(BG_COLORS[0])
  const [text, setText] = useState('')
  const [media, setMedia] = useState(null)
  const [saving, setSaving] = useState(false)
  const previewUrl = useObjectUrl(media)

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be picked again
    if (!file) return
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`That file is too large (max ${MAX_MB} MB)`)
      return
    }
    setMedia(file)
    setMode('media')
  }

  const handleCreateStory = async () => {
    if (mode === 'text' && !text.trim()) throw new Error('Write something for your story first')
    if (mode === 'media' && !media) throw new Error('Choose a photo or video first')

    setSaving(true)
    try {
      const form = new FormData()
      if (text.trim()) form.append('content', text.trim())
      if (mode === 'text') form.append('background_color', background)
      if (mode === 'media' && media) form.append('media', media)

      const data = await api.post('/api/stories', form)
      onCreated?.(data.story)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-110 flex min-h-screen items-center justify-center bg-black/80 p-4 text-white backdrop-blur" role="dialog" aria-label="Create story">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between text-center">
          <button onClick={onClose} aria-label="Close" className="cursor-pointer p-2 text-white">
            <ArrowLeft />
          </button>
          <h2 className="text-lg font-semibold">Create Story</h2>
          <span className="w-10"></span>
        </div>

        <div className="relative flex h-96 items-center justify-center overflow-hidden rounded-2xl" style={{ backgroundColor: mode === 'text' ? background : '#111' }}>
          {mode === 'text' && (
            <textarea
              className="h-full w-full resize-none bg-transparent p-6 text-lg text-white placeholder:text-white/60 focus:outline-none"
              placeholder="What's on your mind?"
              maxLength={500}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
          )}
          {mode === 'media' && previewUrl && (media?.type.startsWith('image') ? (
            <img src={previewUrl} alt="" className="max-h-full object-contain" />
          ) : (
            <video src={previewUrl} controls className="max-h-full object-contain" />
          ))}
          {mode === 'media' && !previewUrl && <p className="text-white/60">Choose a photo or video</p>}
        </div>

        {mode === 'text' && (
          <div className="mt-4 flex gap-2">
            {BG_COLORS.map((color) => (
              <button
                key={color}
                aria-label={`Background ${color}`}
                className={`h-7 w-7 cursor-pointer rounded-full ring-2 ${background === color ? 'ring-white' : 'ring-white/20'}`}
                style={{ backgroundColor: color }}
                onClick={() => setBackground(color)}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setMode('text')
              setMedia(null)
            }}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl p-2.5 ${mode === 'text' ? 'bg-white text-black' : 'bg-zinc-800'}`}
          >
            <TextIcon size={18} /> Text
          </button>
          <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl p-2.5 ${mode === 'media' ? 'bg-white text-black' : 'bg-zinc-800'}`}>
            <input onChange={handleMediaUpload} type="file" accept="image/*,video/*" className="hidden" />
            <Upload size={18} /> Photo/Video
          </label>
        </div>

        {mode === 'media' && (
          <input
            className="mt-3 w-full rounded-xl bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none"
            placeholder="Add a caption (optional)"
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        )}

        <button
          disabled={saving}
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: 'Posting your story...',
              success: 'Story added',
              error: (e) => e.message,
            })
          }
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-brand-600 to-accent-600 py-3 font-semibold text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkle size={18} />
          {saving ? 'Posting…' : `Share as ${me?.username ? '@' + me.username : 'story'}`}
        </button>
      </div>
    </div>
  )
}

export default StoryModal
