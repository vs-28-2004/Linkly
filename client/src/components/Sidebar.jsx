import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/clerk-react'
import MenuItems from './MenuItems'
import Logo from './Logo'
import { useCurrentUser } from '../context/useCurrentUser'
import { btnPrimary } from '../lib/ui'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { me, unread } = useCurrentUser()

  return (
    <aside
      className={`top-0 bottom-0 z-20 flex w-64 shrink-0 flex-col justify-between border-r border-stone-200 bg-white transition-transform duration-200 max-sm:absolute xl:w-72 ${
        sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'
      }`}
    >
      <div className="py-5">
        <button onClick={() => navigate('/')} className="mb-6 ml-7 cursor-pointer" aria-label="Linkly home">
          <Logo />
        </button>

        <MenuItems setSidebarOpen={setSidebarOpen} unread={unread} />

        <Link to="/create-post" onClick={() => setSidebarOpen(false)} className={`${btnPrimary} mx-6 mt-6 py-2.5`}>
          <CirclePlus className="h-5 w-5" />
          Create Post
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-stone-200 p-4 px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserButton />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{me?.full_name}</p>
            <p className="truncate text-xs text-stone-500">@{me?.username}</p>
          </div>
        </div>
        <button onClick={() => signOut()} aria-label="Sign out" className="cursor-pointer text-stone-400 transition hover:text-stone-700">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
