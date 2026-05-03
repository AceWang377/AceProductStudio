export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-5">
          <div className="h-8 w-48 animate-pulse rounded bg-white" />
          <div className="h-32 animate-pulse rounded bg-white" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded bg-white" />
            <div className="h-24 animate-pulse rounded bg-white" />
            <div className="h-24 animate-pulse rounded bg-white" />
          </div>
          <div className="h-72 animate-pulse rounded bg-white" />
        </section>
        <aside className="h-96 animate-pulse rounded bg-white" />
      </div>
    </div>
  );
}
