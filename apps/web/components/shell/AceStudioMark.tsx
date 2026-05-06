import Image from "next/image";

export function AceStudioMark({ className = "" }: { className?: string }) {
  return (
    <span className={`grid h-10 w-10 place-items-center overflow-hidden rounded bg-white shadow-sm ${className}`} aria-hidden>
      <Image
        src="/brand/ace-studio-logo.png"
        alt=""
        width={40}
        height={40}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}
