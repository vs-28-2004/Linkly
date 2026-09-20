import { useEffect, useMemo, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'

// Empty in development (Vite proxies /api -> http://localhost:4000) and when the Express server
// also serves the built client. Set VITE_API_URL only when the API lives on a different domain.
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

async function send(getToken, method, path, body) {
  const token = await getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (body instanceof FormData) {
    payload = body // the browser sets the multipart boundary itself
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(`${BASE}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and try again.")
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // empty or non-JSON body
  }

  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status, data)
  }
  return data
}

/**
 * Returns a stable { get, post, put, del } object that automatically attaches the signed-in
 * user's Clerk token. The object never changes identity, so it is safe to use inside
 * useEffect / useCallback dependency arrays.
 */
export function useApi() {
  const { getToken } = useAuth()
  const tokenRef = useRef(getToken)

  useEffect(() => {
    tokenRef.current = getToken
  }, [getToken])

  return useMemo(() => {
    const token = () => tokenRef.current()
    return {
      get: (path) => send(token, 'GET', path),
      post: (path, body) => send(token, 'POST', path, body),
      put: (path, body) => send(token, 'PUT', path, body),
      del: (path) => send(token, 'DELETE', path),
    }
  }, [])
}
