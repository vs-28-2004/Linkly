import React, { useCallback, useEffect, useState } from 'react'
import { Users, UserCheck, UserPlus, UserRoundPen, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Avatar from '../components/Avatar'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { useCurrentUser } from '../context/useCurrentUser'
import { btnPrimary, btnSoft, card, pageWrap } from '../lib/ui'

const Connections = () => {
  const api = useApi()
  const navigate = useNavigate()
  const { me, follow, unfollow } = useCurrentUser()

  const [tab, setTab] = useState('Followers')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    const [followers, following, pending, connections] = await Promise.all([
      api.get(`/api/connections/followers/${me._id}`),
      api.get(`/api/connections/following/${me._id}`),
      api.get('/api/connections/pending'),
      api.get('/api/connections'),
    ])
    return {
      Followers: followers.followers,
      Following: following.following,
      Pending: pending.pending,
      Connections: connections.connections,
    }
  }, [api, me._id])

  useEffect(() => {
    let alive = true
    fetchAll()
      .then((result) => alive && setData(result))
      .catch((err) => alive && setError(err.message))
    return () => {
      alive = false
    }
  }, [fetchAll])

  const act = async (action) => {
    try {
      await action()
      setData(await fetchAll())
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (error) return <div className={pageWrap}><EmptyState title="Couldn't load your connections">{error}</EmptyState></div>
  if (!data) return <Loading />

  const tabs = [
    { label: 'Followers', icon: Users },
    { label: 'Following', icon: UserCheck },
    { label: 'Pending', icon: UserRoundPen },
    { label: 'Connections', icon: UserPlus },
  ]

  const hints = {
    Followers: 'People who follow you.',
    Following: "People you follow.",
    Pending: 'They follow you, but you don’t follow them back yet. Accept to become connections.',
    Connections: 'Mutual follows. You can message each other.',
  }

  return (
    <div className={pageWrap}>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Connections</h1>
        <p className="text-stone-500">Manage your network</p>
      </div>

      {/* Counts */}
      <div className="mb-6 flex flex-wrap gap-4">
        {tabs.map(({ label }) => (
          <div key={label} className={`${card} flex h-20 w-36 flex-col items-center justify-center gap-0.5`}>
            <b className="text-xl">{data[label].length}</b>
            <p className="text-sm text-stone-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="inline-flex flex-wrap items-center rounded-xl border border-stone-200 bg-white p-1 shadow-sm" role="tablist">
        {tabs.map(({ label, icon: Icon }) => (
          <button
            key={label}
            role="tab"
            aria-selected={tab === label}
            onClick={() => setTab(label)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              tab === label ? 'bg-brand-600 text-white' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}{' '}
            <span className="opacity-70">({data[label].length})</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-stone-500">{hints[tab]}</p>

      {/* List */}
      {data[tab].length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Users} title={`No ${tab.toLowerCase()} yet`}>
            {tab === 'Followers' || tab === 'Connections' ? 'Post and follow people to grow your network.' : 'Nothing to show here right now.'}
          </EmptyState>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-5">
          {data[tab].map((user) => (
            <div key={user._id} className={`${card} flex w-full max-w-88 gap-4 p-5`}>
              <Avatar user={user} size={52} className="shadow-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-stone-800">{user.full_name}</p>
                <p className="text-sm text-stone-500">@{user.username}</p>
                {user.bio && <p className="mt-1 line-clamp-2 text-sm text-stone-500">{user.bio}</p>}

                <div className="mt-4 flex gap-2 max-sm:flex-col">
                  <button onClick={() => navigate(`/profile/${user._id}`)} className={`${btnPrimary} flex-1`}>
                    View profile
                  </button>

                  {tab === 'Following' && (
                    <button onClick={() => act(() => unfollow(user._id))} className={`${btnSoft} flex-1`}>
                      Unfollow
                    </button>
                  )}
                  {tab === 'Pending' && (
                    <button onClick={() => act(() => follow(user._id))} className={`${btnSoft} flex-1`}>
                      Accept
                    </button>
                  )}
                  {tab === 'Followers' && !me.following.includes(user._id) && (
                    <button onClick={() => act(() => follow(user._id))} className={`${btnSoft} flex-1`}>
                      Follow back
                    </button>
                  )}
                  {tab === 'Connections' && (
                    <button onClick={() => navigate(`/messages/${user._id}`)} className={`${btnSoft} flex-1`}>
                      <MessageSquare className="h-4 w-4" />
                      Message
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Connections
