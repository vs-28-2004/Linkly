import React from 'react'

const Loading = ({ height = '100vh' }) => {
  return (
    <div style={{ height }} className="flex items-center justify-center" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-brand-500 border-t-transparent"></div>
    </div>
  )
}

export default Loading
