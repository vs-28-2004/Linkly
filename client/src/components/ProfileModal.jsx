import React, { useState } from 'react'
import { Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from './Avatar'
import { useApi } from '../lib/api'
import { useObjectUrl } from '../lib/useObjectUrl'
import { btnPrimary, btnSoft, inputClass } from '../lib/ui'

const ProfileModal = ({ user, onClose, onSaved }) => {
  const api = useApi()
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    username: user.username || '',
    bio: user.bio || '',
    location: user.location || '',
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const avatarPreview = useObjectUrl(avatarFile)
  const coverPreview = useObjectUrl(coverFile)
  const coverSrc = coverPreview || user.cover_photo

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) return toast.error("Name can't be empty")

    setSaving(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([key, value]) => body.append(key, value))
      if (avatarFile) body.append('profile_picture', avatarFile)
      if (coverFile) body.append('cover_photo', coverFile)

      const data = await api.put('/api/users/profile', body)
      toast.success('Profile updated')
      onSaved(data.user)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-110 h-screen overflow-y-auto bg-black/50 p-2 sm:p-6" role="dialog" aria-label="Edit profile">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Edit profile</h1>
          <button onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-2 text-stone-500 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSave}>
          {/* Profile picture */}
          <div>
            <span className="mb-1 block text-sm font-medium text-stone-700">Profile picture</span>
            <label className="group/avatar relative inline-block cursor-pointer">
              <input hidden type="file" accept="image/*" aria-label="Profile picture" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-24 w-24 rounded-full object-cover" />
              ) : (
                <Avatar user={user} size={96} />
              )}
              <span className="absolute inset-0 hidden items-center justify-center rounded-full bg-black/30 group-hover/avatar:flex">
                <Pencil className="h-5 w-5 text-white" />
              </span>
            </label>
          </div>

          {/* Cover photo */}
          <div>
            <span className="mb-1 block text-sm font-medium text-stone-700">Cover photo</span>
            <label className="group/cover relative block h-40 w-full max-w-md cursor-pointer overflow-hidden rounded-xl bg-linear-to-r from-brand-200 via-accent-100 to-brand-100">
              <input hidden type="file" accept="image/*" aria-label="Cover photo" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              {coverSrc && <img src={coverSrc} alt="" className="h-full w-full object-cover" />}
              <span className="absolute inset-0 hidden items-center justify-center bg-black/20 group-hover/cover:flex">
                <Pencil className="h-5 w-5 text-white" />
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-stone-700">Name</label>
            <input id="full_name" type="text" maxLength={60} className={inputClass} placeholder="Your full name" value={form.full_name} onChange={set('full_name')} />
          </div>

          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-stone-700">Username</label>
            <input id="username" type="text" maxLength={30} className={inputClass} placeholder="letters, numbers, . or _" value={form.username} onChange={set('username')} />
          </div>

          <div>
            <label htmlFor="bio" className="mb-1 block text-sm font-medium text-stone-700">Bio</label>
            <textarea id="bio" rows={3} maxLength={200} className={inputClass} placeholder="Tell people a little about you" value={form.bio} onChange={set('bio')} />
            <p className="mt-1 text-right text-xs text-stone-400">{form.bio.length}/200</p>
          </div>

          <div>
            <label htmlFor="location" className="mb-1 block text-sm font-medium text-stone-700">Location</label>
            <input id="location" type="text" maxLength={60} className={inputClass} placeholder="City, Country" value={form.location} onChange={set('location')} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={btnSoft}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProfileModal
