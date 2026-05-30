'use client'

import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6 max-w-xl">
      <div className="border border-border rounded-xl p-6 space-y-3">
        <h2 className="text-xl font-semibold">Unable to load this page</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || 'An unexpected error happened while loading app data.'}
        </p>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  )
}
