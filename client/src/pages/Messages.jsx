import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, User } from 'lucide-react'
import moment from 'moment'
import Avatar from '../components/Avatar'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'
import { btnPrimary, card, pageWrap } from '../lib/ui'

const Messages = () => {
  const api = useApi()
  const { me } = useCurrentUser()
  const [state, setState] = useState(null) // { conversations, connections }
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([api.get('/api/messages/conversations'), api.get('/api/connections')])
      .then(([chats, conns]) => alive && setState({ conversations: chats.conversations, connections: conns.connections }))
      .catch((err) => alive && setError(err.message))
    return () => {
      alive = false
    }
  }, [api])

  if (error) return <div className={pageWrap}><EmptyState title="Couldn't load your messages">{error}</EmptyState></div>
  if (!state) return <Loading />

  // Connections you haven't chatted with yet are offered as "start a chat" shortcuts.
  const chattedWith = new Set(state.conversations.map((c) => c.user._id))
  const newChats = state.connections.filter((u) => !chattedWith.has(u._id))

  return (
    <div className={pageWrap}>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Messages</h1>
        <p className="text-stone-500">Talk to your friends and family</p>
      </div>

      {state.conversations.length === 0 && newChats.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          action={<Link to="/discover" className={btnPrimary}>Find people</Link>}
        >
          Follow people back to become connections, or open anyone&apos;s profile and press Message.
        </EmptyState>
      )}

      <div className="flex max-w-xl flex-col gap-3">
        {state.conversations.map(({ user, last_message, unread }) => (
          <Link key={user._id} to={`/messages/${user._id}`} className={`${card} flex items-center gap-4 p-4 transition hover:shadow-md`}>
            <Avatar user={user} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-semibold text-stone-800">{user.full_name}</p>
                <p className="shrink-0 text-xs text-stone-400">{moment(last_message.createdAt).fromNow()}</p>
              </div>
              <p className={`truncate text-sm ${unread > 0 ? 'font-semibold text-stone-800' : 'text-stone-500'}`}>
                {last_message.sender === me._id && 'You: '}
                {last_message.message_type === 'image' && !last_message.content ? 'Photo' : last_message.content}
              </p>
            </div>
            {unread > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-600 px-1.5 text-xs font-bold text-white">{unread}</span>
            )}
          </Link>
        ))}
      </div>

      {newChats.length > 0 && (
        <div className="mt-8 max-w-xl">
          <h2 className="mb-3 text-sm font-bold tracking-wide text-stone-500 uppercase">Start a chat</h2>
          <div className="flex flex-col gap-3">
            {newChats.map((user) => (
              <div key={user._id} className={`${card} flex items-center gap-4 p-4`}>
                <Avatar user={user} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-800">{user.full_name}</p>
                  <p className="text-sm text-stone-500">@{user.username}</p>
                </div>
                <Link to={`/messages/${user._id}`} aria-label={`Message ${user.full_name}`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 transition hover:bg-stone-200">
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <Link to={`/profile/${user._id}`} aria-label={`View ${user.full_name}'s profile`} className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 transition hover:bg-stone-200">
                  <User className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
