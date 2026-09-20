import React, { useId } from 'react'

/** Linkly mark (gradient tile with a chain link) + wordmark. */
const Logo = ({ size = 32, showText = true, className = '' }) => {
  const gradientId = useId()
  return (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e2500f" />
          <stop offset="1" stopColor="#c81e6e" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <g stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.2 18.8l5.6-5.6" />
        <path d="M15.6 10.8l1.5-1.5a4.6 4.6 0 0 1 6.5 6.5l-1.5 1.5" />
        <path d="M16.4 21.2l-1.5 1.5a4.6 4.6 0 0 1-6.5-6.5l1.5-1.5" />
      </g>
    </svg>
    {showText && (
      <span className="bg-linear-to-r from-brand-600 to-accent-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
        Linkly
      </span>
    )}
  </span>
  )
}

export default Logo
