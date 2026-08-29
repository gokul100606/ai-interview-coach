import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unexpected application error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-4">
          <Card className="w-full max-w-md p-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-ink-800">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-ink-400">
              An unexpected error occurred. Please try again.
            </p>

            <Button className="mt-6" onClick={this.handleReset}>
              Try again
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}