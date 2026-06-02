import type { PropsWithChildren } from "react";

type SurfaceProps = PropsWithChildren<{
  className?: string;
}>;

export function Surface({ children, className = "" }: SurfaceProps) {
  return <section className={`glass-panel rounded-[28px] p-5 sm:p-7 ${className}`}>{children}</section>;
}
