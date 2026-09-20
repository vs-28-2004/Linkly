import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useApi } from '../lib/api'
import { CurrentUserContext } from './currentUserContext'

const UNREAD_POLL_MS = 20000

/**
 * Loads (and creates, if needed) the signed-in user's Linkly profile once and shares it - together
 * with follow/unfollow helpers and the unread-message count - with the whole app.
 */
const CurrentUserProvider = ({ children }) => {
  const api = useApi()
  const [me, setMe] = useState(null)
  const [error, setError] = useState(null)
  const [unread, setUnread] = useState(0)

  const reloadMe = useCallback(async () => {
    try {
      const data = await api.post('/api/users/sync')
      setMe(data.user)
      setError(null)
    } catch (err) {
      setError(err)
    }
  }, [api])

  useEffect(() => {
    reloadMe()
  }, [reloadMe])

  const refreshUnread = useCallback(async () => {
    try {
      const data = await api.get('/api/messages/unread-count')
      setUnread(data.count || 0)
    } catch {
      // the badge just won't update this time
    }
  }, [api])

  // Keep the unread badge fresh
  useEffect(() => {
    refreshUnread()
    const id = setInterval(refreshUnread, UNREAD_POLL_MS)
    return () => clearInterval(id)
  }, [refreshUnread])

  const follow = useCallback(
    async (userId) => {
      await api.post(`/api/connections/follow/${userId}`)
      setMe((m) => (m ? { ...m, following: [...new Set([...m.following, userId])] } : m))
    },
    [api]
  )

  const unfollow = useCallback(
    async (userId) => {
      await api.del(`/api/connections/unfollow/${userId}`)
      setMe((m) => (m ? { ...m, following: m.following.filter((id) => id !== userId) } : m))
    },
    [api]
  )

  const value = useMemo(
    () => ({ me, setMe, error, reloadMe, follow, unfollow, unread, refreshUnread }),
    [me, error, reloadMe, follow, unfollow, unread, refreshUnread]
  )

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
}

export default CurrentUserProvider
