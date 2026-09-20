import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MessageCircle, Search, User, Users } from 'lucide-react'

const menuItems = [
  { to: '/', label: 'Feed', Icon: Home },
  { to: '/messages', label: 'Messages', Icon: MessageCircle },
  { to: '/connections', label: 'Connections', Icon: Users },
  { to: '/discover', label: 'Discover', Icon: Search },
  { to: '/profile', label: 'Profile', Icon: User },
]

const MenuItems = ({ setSidebarOpen, unread = 0 }) => {
  return (
    <nav className="space-y-1 px-4 font-medium text-stone-600">
      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={() => setSidebarOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition ${
              isActive ? 'bg-brand-50 text-brand-700' : 'hover:bg-stone-50'
            }`
          }
        >
          <item.Icon className="h-5 w-5" />
          <span className="flex-1">{item.label}</span>
          {item.to === '/messages' && unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1.5 text-[11px] font-bold text-white">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export default MenuItems
