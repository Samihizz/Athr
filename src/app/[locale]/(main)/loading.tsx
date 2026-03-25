export default function Loading() {
  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
      {/* Page header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 rounded-lg bg-surface animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-surface animate-pulse mt-3" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-surface animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-surface animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-surface animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-surface animate-pulse" />
              <div className="h-3 w-5/6 rounded bg-surface animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
