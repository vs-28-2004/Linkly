import React, { useEffect, useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import { useApi } from '../lib/api'
import { card, inputClass, pageWrap } from '../lib/ui'

const DEBOUNCE_MS = 350

const Discover = () => {
  const api = useApi()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  // `query` records which search the results belong to (see Feed for the same pattern).
  const [result, setResult] = useState({ query: null, users: [], error: null })

  // Wait until the user stops typing before searching
  useEffect(() => {
    const id = setTimeout(() => setQuery(input.trim()), DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [input])

  useEffect(() => {
    let alive = true
    const path = query ? `/api/users/search?query=${encodeURIComponent(query)}` : '/api/users/all?limit=24'
    api
      .get(path)
      .then((data) => alive && setResult({ query, users: data.users, error: null }))
      .catch((error) => alive && setResult({ query, users: [], error: error.message }))
    return () => {
      alive = false
    }
  }, [api, query])

  const loading = result.query !== query

  return (
    <div className={pageWrap}>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Discover people</h1>
        <p className="text-stone-500">Find interesting people and grow your network</p>
      </div>

      <div className={`${card} mb-6 p-4`}>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Search by name, username, bio or location…"
            aria-label="Search people"
            className={`${inputClass} pl-11`}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
        </div>
      </div>

      {loading && <Loading height="40vh" />}

      {!loading && result.error && <EmptyState title="Search failed">{result.error}</EmptyState>}

      {!loading && !result.error && result.users.length === 0 && (
        <EmptyState icon={SearchX} title={query ? `No one found for "${query}"` : 'No one to show yet'}>
          {query ? 'Try a different name or username.' : 'Invite a friend to join Linkly!'}
        </EmptyState>
      )}

      {!loading && (
        <div className="flex flex-wrap gap-5">
          {result.users.map((user) => (
            <UserCard user={user} key={user._id} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Discover
