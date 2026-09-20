import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from './Avatar'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'
import { card } from '../lib/ui'

/** "People to follow" card for the feed's right-hand column. */
const SuggestedUsers = () => {
  const api = useApi()
  const { follow } = useCurrentUser()
  const [users, setUsers] = useState([])

  useEffect(() => {
    let alive = true
    api
      .get('/api/users/all?limit=4&exclude_following=1')
      .then((data) => alive && setUsers(data.users || []))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [api])

  const handleFollow = async (user) => {
    try {
      await follow(user._id)
      setUsers((list) => list.filter((u) => u._id !== user._id))
      toast.success(`Following ${user.full_name}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (users.length === 0) return null

  return (
    <div className={`${card} w-72 p-4 text-xs`}>
      <h3 className="mb-3 text-sm font-bold text-stone-800">People to follow</h3>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user._id} className="flex items-center gap-2.5">
            <Link to={`/profile/${user._id}`}>
              <Avatar user={user} size={34} />
            </Link>
            <div className="min-w-0 flex-1">
              <Link to={`/profile/${user._id}`} className="block truncate font-semibold text-stone-800 hover:underline">
                {user.full_name}
              </Link>
              <p className="truncate text-stone-500">@{user.username}</p>
            </div>
            <button
              onClick={() => handleFollow(user)}
              aria-label={`Follow ${user.full_name}`}
              className="cursor-pointer rounded-full bg-brand-50 p-2 text-brand-700 transition hover:bg-brand-100"
            >
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuggestedUsers
