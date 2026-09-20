import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const root = createRoot(document.getElementById('root'))

if (!PUBLISHABLE_KEY) {
  // A readable message beats a blank page
  root.render(
    <div style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 560, margin: '10vh auto' }}>
      <h1>Linkly is not configured yet</h1>
      <p>
        Create <code>client/.env</code> and set <code>VITE_CLERK_PUBLISHABLE_KEY</code> (see <code>client/.env.example</code>), then restart{' '}
        <code>npm run dev</code>.
      </p>
    </div>
  )
} else {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ClerkProvider>
      </ErrorBoundary>
    </StrictMode>
  )
}
