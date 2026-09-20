import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, MessageCircle, UserCheck, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from './Avatar'
import { useCurrentUser } from '../context/useCurrentUser'
import { btnPrimary, btnSoft, card } from '../lib/ui'

const UserCard = ({ user }) => {
  const navigate = useNavigate()
  const { me, follow, unfollow } = useCurrentUser()
  const [busy, setBusy] = useState(false)

  const isFollowing = me.following.includes(user._id)

  const toggleFollow = async () => {
    setBusy(true)
    try {
      await (isFollowing ? unfollow(user._id) : follow(user._id))
    } catch (error) {
      toast.error(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`${card} flex w-72 flex-col justify-between p-5`}>
      <div className="text-center">
        <Link to={`/profile/${user._id}`} className="inline-block">
          <Avatar user={user} size={68} className="mx-auto shadow-md" />
        </Link>
        <p className="mt-3 font-semibold">{user.full_name}</p>
        <p className="text-sm text-stone-500">@{user.username}</p>
        {user.bio && <p className="mt-2 line-clamp-3 px-2 text-sm text-stone-600">{user.bio}</p>}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-600">
        {user.location && (
          <span className="flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1">
            <MapPin className="h-3.5 w-3.5" /> {user.location}
          </span>
        )}
        <span className="rounded-full border border-stone-200 px-3 py-1">
          {user.followers_count ?? 0} {user.followers_count === 1 ? 'follower' : 'followers'}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={toggleFollow} disabled={busy} className={`${isFollowing ? btnSoft : btnPrimary} flex-1`}>
          {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isFollowing ? 'Following' : 'Follow'}
        </button>
        <button onClick={() => navigate(`/messages/${user._id}`)} aria-label={`Message ${user.full_name}`} className={`${btnSoft} px-3.5`}>
          <MessageCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default UserCard
