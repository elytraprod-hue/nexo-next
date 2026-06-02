import type { PropsWithChildren } from "react";

type BadgeProps = PropsWithChildren<{
  color?: string;
  className?: string;
}>;

export function Badge({ children, color = "var(--orange)", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${className}`}
      style={{
        borderColor: `${color}55`,
        background: `${color}18`,
        color,
      }}
    >
      {children}
    </span>
  );
}
