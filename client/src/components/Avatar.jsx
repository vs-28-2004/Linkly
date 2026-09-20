import React, { useState } from 'react'

const initialsOf = (user) => {
  const name = (user?.full_name || user?.username || '?').trim()
  const parts = name.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] || '?') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

const AvatarInner = ({ user, size, className }) => {
  const [failed, setFailed] = useState(false)
  const style = { width: size, height: size }

  if (user?.profile_picture && !failed) {
    return (
      <img
        src={user.profile_picture}
        alt=""
        style={style}
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <span
      style={{ ...style, fontSize: Math.max(10, Math.round(size * 0.38)) }}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-linear-to-br from-brand-400 to-accent-500 font-bold text-white ${className}`}
      aria-hidden="true"
    >
      {initialsOf(user)}
    </span>
  )
}

/** Round profile picture. Falls back to coloured initials when there is no picture or it fails to load. */
const Avatar = ({ user, size = 40, className = '' }) => (
  <AvatarInner key={user?.profile_picture || ''} user={user} size={size} className={className} />
)

export default Avatar
