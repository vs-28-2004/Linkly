import React, { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useClerk } from '@clerk/clerk-react'
import Sidebar from '../components/Sidebar'
import Loading from '../components/Loading'
import { useCurrentUser } from '../context/useCurrentUser'
import { btnPrimary, btnSoft } from '../lib/ui'

const Layout = () => {
  const { me, error, reloadMe } = useCurrentUser()
  const { signOut } = useClerk()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const mainRef = useRef(null)
  const { pathname } = useLocation()

  // Start every page at the top
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  if (!me && error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">We couldn&apos;t load your account</h1>
        <p className="max-w-md text-stone-500">{error.message}</p>
        <div className="flex gap-2">
          <button className={btnPrimary} onClick={reloadMe}>
            Try again
          </button>
          <button className={btnSoft} onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  if (!me) return <Loading />

  return (
    <div className="flex h-screen w-full">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {sidebarOpen && <div className="fixed inset-0 z-10 bg-black/30 sm:hidden" onClick={() => setSidebarOpen(false)} />}

      <main ref={mainRef} className="relative h-screen flex-1 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          className="absolute top-3 right-3 z-30 h-10 w-10 rounded-xl bg-white p-2 text-stone-600 shadow sm:hidden"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </button>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
