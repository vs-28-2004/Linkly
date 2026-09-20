import { useContext } from 'react'
import { CurrentUserContext } from './currentUserContext'

/** { me, setMe, error, reloadMe, follow, unfollow, unread, refreshUnread } for the signed-in user. */
export function useCurrentUser() {
  const value = useContext(CurrentUserContext)
  if (!value) throw new Error('useCurrentUser must be used inside <CurrentUserProvider>')
  return value
}
