export function AceStudioMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded bg-ink text-[11px] font-semibold tracking-wide text-white shadow-sm ${className}`}
      aria-hidden
    >
      <span className="absolute inset-x-1 top-1 h-2 rounded-full bg-action/70" />
      <span className="absolute -bottom-3 -right-2 h-7 w-7 rounded-full bg-white/12" />
      <span className="relative">AS</span>
    </span>
  );
}
