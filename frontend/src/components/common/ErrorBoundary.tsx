import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from './CharacterState'

/**
 * Top-level React error boundary (audit T-P1-12 / GAP-F5).
 *
 * Previously the app had NO error boundary anywhere: an uncaught render
 * error in any (lazily-loaded) page bubbled to the root and produced a blank
 * white screen — the worst possible outcome for a children's product. This
 * boundary catches those errors and renders the on-brand, reassuring
 * ErrorState (companion character + "Try again") instead, and offers a full
 * reload as the recovery action.
 *
 * Scope note: React error boundaries only catch errors thrown during render,
 * in lifecycle methods, and in constructors of the tree below them. They do
 * NOT catch errors in event handlers or async code (those are handled by
 * React Query's per-query error states + the page-level ErrorState usage).
 */

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaced for local debugging / future error-reporting hook (e.g.
    // Sentry/OpenTelemetry per the OSS audit). Kept as console.error for now
    // so no third-party dependency is introduced without a decision.
    console.error('Unhandled UI error caught by ErrorBoundary:', error, info.componentStack)
  }

  private handleReload = () => {
    // Full reload is the safest generic recovery for an unknown render fault.
    window.location.reload()
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-100 p-4">
          <div className="max-w-md w-full">
            <ErrorState
              character="Azouz"
              title="Something went sideways"
              message="The app hit a little bump. A quick refresh usually sorts it out."
              onRetry={this.handleReload}
              retryLabel="Refresh"
            />
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
