import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={cn("h-7 w-7", className)}
    >
      {/* uap */}
      <path
        d="M11 9c-2-2 2-3 0-5M16 9c-2-2 2-3 0-5M21 9c-2-2 2-3 0-5"
        stroke="#E8B25C"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* sayak */}
      <path
        d="M4 14h24c0 7.5-5 12-12 12S4 21.5 4 14Z"
        fill="#C8782A"
      />
      <path d="M11 28h10" stroke="#C8782A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
