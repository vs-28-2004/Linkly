import React from 'react'
import { btnPrimary } from '../lib/ui'

/** Catches render errors so a bug shows a message instead of a blank white page. */
class ErrorBoundary extends React.Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('UI error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-stone-500">Try reloading the page. If it keeps happening, let us know what you were doing.</p>
        <button className={btnPrimary} onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
