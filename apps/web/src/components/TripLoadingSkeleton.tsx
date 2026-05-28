export function TripLoadingSkeleton() {
  return (
    <main className="min-h-screen bg-bg overflow-x-clip">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          <aside className="w-full lg:w-72 lg:shrink-0 flex flex-col gap-6">
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3 animate-pulse">
              <div className="h-5 bg-border rounded w-3/4" />
              <div className="h-3.5 bg-border rounded w-1/2" />
              <div className="h-3 bg-border rounded w-2/3 mt-1" />
            </div>
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3 animate-pulse">
              <div className="h-4 bg-border rounded w-1/3" />
              <div className="h-3 bg-border rounded w-full" />
              <div className="h-3 bg-border rounded w-4/5" />
              <div className="h-3 bg-border rounded w-3/5" />
            </div>
            <div className="bg-bg-card rounded-[var(--radius-card)] border border-border p-5 flex flex-col gap-3 animate-pulse">
              <div className="h-4 bg-border rounded w-1/4" />
              <div className="h-8 bg-border rounded w-full" />
            </div>
          </aside>
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            <div className="flex gap-2 animate-pulse">
              <div className="h-8 bg-border rounded-lg w-24" />
              <div className="h-8 bg-border rounded-lg w-32" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-bg-card rounded-[var(--radius-card)] border border-border p-4 flex items-center gap-3 animate-pulse"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-border rounded w-2/5" />
                  <div className="h-3 bg-border rounded w-1/4" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-6 w-14 bg-border rounded-full" />
                  <div className="h-6 w-14 bg-border rounded-full" />
                  <div className="h-6 w-14 bg-border rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
