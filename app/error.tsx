'use client'

import { Button } from '@/components/ui/button'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-background grid place-items-center p-6">
      <div className="max-w-md w-full border border-border rounded-xl p-6 space-y-3 text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || 'Unexpected application error.'}
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  )
}
