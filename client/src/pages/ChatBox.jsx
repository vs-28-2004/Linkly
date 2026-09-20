import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SendHorizonal, ImageIcon, ArrowLeft, X } from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'
import Avatar from '../components/Avatar'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { useObjectUrl } from '../lib/useObjectUrl'
import { useCurrentUser } from '../context/useCurrentUser'

const POLL_MS = 4000

const ChatBox = () => {
  const { userId } = useParams()
  const api = useApi()
  const { me, refreshUnread } = useCurrentUser()

  // `userId` records which conversation the data belongs to, so switching chats shows the spinner.
  const [chat, setChat] = useState({ userId: null, user: null, messages: [], error: null })
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [sending, setSending] = useState(false)
  const imagePreview = useObjectUrl(image)
  const endRef = useRef(null)

  const load = useCallback(async () => {
    const data = await api.get(`/api/messages/conversation/${userId}`)
    setChat({ userId, user: data.user, messages: data.messages, error: null })
    refreshUnread() // opening a conversation marks it as read
  }, [api, userId, refreshUnread])

  // Load, then poll for new messages
  useEffect(() => {
    let alive = true
    const tick = () =>
      load().catch((error) => alive && setChat((c) => (c.userId === userId ? c : { userId, user: null, messages: [], error: error.message })))
    tick()
    const id = setInterval(tick, POLL_MS)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [load, userId])

  const messageCount = chat.messages.length
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageCount])

  const sendMessage = async () => {
    if ((!text.trim() && !image) || sending) return

    setSending(true)
    try {
      const form = new FormData()
      form.append('receiver', userId)
      if (text.trim()) form.append('content', text.trim())
      if (image) form.append('image', image)

      const data = await api.post('/api/messages', form)
      setChat((c) => ({ ...c, messages: [...c.messages, data.sent] }))
      setText('')
      setImage(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  if (chat.userId !== userId) return <Loading />

  if (chat.error || !chat.user) {
    return (
      <div className="p-6">
        <EmptyState title="Conversation unavailable">{chat.error || 'This user could not be found.'}</EmptyState>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-200 bg-white/80 p-3 backdrop-blur md:px-10 xl:pl-10">
        <Link to="/messages" aria-label="Back to messages" className="text-stone-500 hover:text-stone-900 sm:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Link to={`/profile/${chat.user._id}`} className="flex items-center gap-3">
          <Avatar user={chat.user} size={38} />
          <div>
            <p className="leading-tight font-semibold">{chat.user.full_name}</p>
            <p className="text-sm text-stone-500">@{chat.user.username}</p>
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="h-full overflow-y-auto p-5 md:px-10">
        <div className="mx-auto max-w-4xl space-y-3">
          {chat.messages.length === 0 && <p className="py-10 text-center text-sm text-stone-400">No messages yet. Say hello 👋</p>}

          {chat.messages.map((message) => {
            const mine = message.sender === me._id
            return (
              <div key={message._id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-sm rounded-2xl p-2.5 text-sm shadow-sm ${
                    mine ? 'rounded-br-md bg-linear-to-br from-brand-600 to-accent-600 text-white' : 'rounded-bl-md bg-white text-stone-800'
                  }`}
                >
                  {message.message_type === 'image' && (
                    <a href={message.media_url} target="_blank" rel="noopener noreferrer">
                      <img src={message.media_url} className="mb-1 w-full max-w-xs rounded-xl" alt="" />
                    </a>
                  )}
                  {message.content && <p className="break-words whitespace-pre-line">{message.content}</p>}
                </div>
                <span className="mt-0.5 px-1 text-[10px] text-stone-400">{moment(message.createdAt).format('h:mm A')}</span>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="px-4">
        <div className="mx-auto mb-5 flex w-full max-w-xl items-center gap-3 rounded-full border border-stone-200 bg-white p-1.5 pl-5 shadow">
          <input
            type="text"
            className="flex-1 text-stone-700 outline-none placeholder:text-stone-400"
            placeholder="Type a message…"
            aria-label="Message"
            maxLength={2000}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          {image ? (
            <span className="relative">
              <img src={imagePreview} alt="Selected" className="h-8 w-8 rounded object-cover" />
              <button onClick={() => setImage(null)} aria-label="Remove image" className="absolute -top-1.5 -right-1.5 cursor-pointer rounded-full bg-stone-900 p-0.5 text-white">
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : (
            <label htmlFor="chat-image" aria-label="Attach image" className="cursor-pointer">
              <ImageIcon className="size-7 text-stone-400 transition hover:text-brand-600" />
            </label>
          )}
          <input
            type="file"
            id="chat-image"
            accept="image/*"
            hidden
            onChange={(e) => {
              setImage(e.target.files?.[0] || null)
              e.target.value = ''
            }}
          />

          <button
            onClick={sendMessage}
            disabled={sending || (!text.trim() && !image)}
            aria-label="Send"
            className="cursor-pointer rounded-full bg-linear-to-br from-brand-600 to-accent-600 p-2.5 text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox
