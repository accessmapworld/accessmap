import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Optional reset key — when it changes, the boundary clears its error. */
  resetKey?: unknown
}
interface State {
  error: Error | null
}

/**
 * App-wide safety net. If any descendant throws during render, the user sees
 * an accessible recovery screen instead of a blank page — with options to try
 * again (re-mount the tree) or return home. Errors are logged for diagnostics.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidUpdate(prev: Props) {
    // Clear the error when navigating to a new route (resetKey changes).
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[AccessMap] Uncaught UI error:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-alert/10 text-alert">
            <AlertTriangle size={32} aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
          <p className="max-w-sm text-muted">
            An unexpected error interrupted this page. Your data is safe — you can try again or head back to the map.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => this.setState({ error: null })} className="btn-primary">
              <RotateCcw size={16} aria-hidden="true" /> Try again
            </button>
            <a href="/map" className="btn-ghost">
              <Home size={16} aria-hidden="true" /> Back to map
            </a>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-xl bg-card p-3 text-left text-xs text-muted">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }
    return this.props.children
  }
}
