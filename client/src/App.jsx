import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Layout from './pages/Layout'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import PostPage from './pages/PostPage'
import Loading from './components/Loading'
import CurrentUserProvider from './context/CurrentUserProvider'

const App = () => {
  const { isLoaded, isSignedIn } = useUser()

  // Wait for Clerk before deciding, otherwise signed-in users see the login page flash by.
  if (!isLoaded) return <Loading />
  if (!isSignedIn) return <Login />

  return (
    <CurrentUserProvider>
      <Toaster toastOptions={{ style: { borderRadius: '12px' } }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="post/:postId" element={<PostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </CurrentUserProvider>
  )
}

export default App
