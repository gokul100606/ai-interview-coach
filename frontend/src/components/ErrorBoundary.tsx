import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Top-level error boundary (Phase 10G). Native React class-component
 * mechanism — no third-party package. Catches rendering/lifecycle errors
 * anywhere in the tree below it and shows a clean fallback instead of a
 * blank white screen.
 *
 * Note (React limitation, not a bug here): error boundaries never catch
 * errors from event handlers, async code (e.g. a rejected promise in a
 * useEffect), or errors in the boundary's own render — those are already
 * handled per-page via each page's own try/catch + error state (see
 * InterviewRoom.tsx, Report.tsx, Dashboard.tsx, etc.). This boundary is
 * specifically the last-resort catch for an unexpected render-time crash
 * that nothing else was built to handle.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Real error detail stays in the dev console only — never shown to
    // the user, never sent anywhere.
    console.error('Unhandled UI error:', error, errorInfo)
  }

  handleTryAgain = () => {
    // A full reload rather than just clearing local state: this boundary
    // sits above the router and auth context, so we can't assume anything
    // about the app's internal state is safe to keep after an unknown
    // render-time crash. Simple and reliable beats clever here.
    window.location.reload()
  }

  handleGoToDashboard = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-6">
          <Card className="max-w-md p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rust-50">
              <AlertTriangle className="h-6 w-6 text-rust-600" />
            </div>
            <h1 className="mt-4 font-display text-xl font-semibold text-ink-800">Something went wrong</h1>
            <p className="mt-2 text-sm text-ink-400">
              This page hit an unexpected error. Your data is safe — try again, or head back to the dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={this.handleTryAgain}>Try again</Button>
              <Button variant="secondary" onClick={this.handleGoToDashboard}>
                Back to dashboard
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}