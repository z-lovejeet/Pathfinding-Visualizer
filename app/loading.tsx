export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading page"
      className="flex flex-1 items-center justify-center bg-[#050508] px-6 py-20"
    >
      <div className="flex items-center gap-3 text-sm text-[#aaaacc]">
        <span className="h-3 w-3 animate-pulse rounded-full bg-[#00d4ff]" />
        Loading visualizer…
      </div>
    </div>
  );
}
