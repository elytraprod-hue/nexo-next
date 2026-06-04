import type { PropsWithChildren } from "react";

type SurfaceProps = PropsWithChildren<{
  className?: string;
}>;

export function Surface({ children, className = "" }: SurfaceProps) {
  return <section className={`glass-panel rounded-2xl p-4 sm:p-5 ${className}`}>{children}</section>;
}
