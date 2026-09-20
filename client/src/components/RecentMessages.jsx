import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import Avatar from './Avatar'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'
import { card } from '../lib/ui'

const preview = (message, meId) => {
  const text = message.message_type === 'image' && !message.content ? 'Photo' : message.content
  return message.sender === meId ? `You: ${text}` : text
}

const RecentMessages = () => {
  const api = useApi()
  const { me, unread } = useCurrentUser()
  const [conversations, setConversations] = useState(null)

  // Reload when the unread count changes so new messages show up without a refresh.
  useEffect(() => {
    let alive = true
    api
      .get('/api/messages/conversations')
      .then((data) => alive && setConversations((data.conversations || []).slice(0, 6)))
      .catch(() => alive && setConversations([]))
    return () => {
      alive = false
    }
  }, [api, unread])

  return (
    <div className={`${card} w-72 p-4 text-xs`}>
      <h3 className="mb-3 text-sm font-bold text-stone-800">Recent messages</h3>

      {conversations === null && <p className="text-stone-400">Loading…</p>}
      {conversations?.length === 0 && <p className="text-stone-400">No conversations yet. Say hi to someone!</p>}

      <div className="no-scrollbar flex max-h-60 flex-col overflow-y-auto">
        {conversations?.map(({ user, last_message, unread: unreadHere }) => (
          <Link key={user._id} to={`/messages/${user._id}`} className="flex items-start gap-2.5 rounded-lg px-1 py-2 transition hover:bg-stone-50">
            <Avatar user={user} size={34} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <p className="truncate font-semibold text-stone-800">{user.full_name}</p>
                <p className="shrink-0 text-[10px] text-stone-400">{moment(last_message.createdAt).fromNow(true)}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-stone-500">{preview(last_message, me._id)}</p>
                {unreadHere > 0 && (
                  <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-accent-600 px-1 text-[10px] font-bold text-white">
                    {unreadHere}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentMessages
