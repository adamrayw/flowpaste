export default function AppLoading() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-52 rounded-md bg-card animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
      <div className="h-72 rounded-xl border border-border bg-card animate-pulse" />
    </div>
  )
}
