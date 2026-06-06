import type { PropsWithChildren } from "react";

type SurfaceProps = PropsWithChildren<{
  className?: string;
}>;

export function Surface({ children, className = "" }: SurfaceProps) {
  return <section className={`glass-panel premium-surface rounded-[var(--radius-panel)] p-5 sm:p-6 ${className}`}>{children}</section>;
}
