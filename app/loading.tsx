export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background grid place-items-center p-6">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading FlowPaste...</p>
      </div>
    </div>
  )
}
