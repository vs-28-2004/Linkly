import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PostCard from '../components/PostCard'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { btnSoft, pageWrap } from '../lib/ui'

/** A single post with its comments open - this is where the "Share" link points. */
const PostPage = () => {
  const { postId } = useParams()
  const api = useApi()
  const navigate = useNavigate()
  const [state, setState] = useState({ postId: null, post: null, error: null })

  useEffect(() => {
    let alive = true
    api
      .get(`/api/posts/${postId}`)
      .then((data) => alive && setState({ postId, post: data.post, error: null }))
      .catch((error) => alive && setState({ postId, post: null, error: error.message }))
    return () => {
      alive = false
    }
  }, [api, postId])

  if (state.postId !== postId) return <Loading />

  return (
    <div className={pageWrap}>
      <button onClick={() => navigate(-1)} className={`${btnSoft} mb-4`}>
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {state.post ? (
        <PostCard post={state.post} startOpen onDeleted={() => navigate('/')} />
      ) : (
        <EmptyState title="Post not found">{state.error || 'This post may have been deleted.'}</EmptyState>
      )}
    </div>
  )
}

export default PostPage
