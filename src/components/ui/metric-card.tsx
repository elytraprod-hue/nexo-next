import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type MetricCardProps = {
  color: string;
  href?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  label: string;
  supporting?: string;
  value: React.ReactNode;
};

export function MetricCard({ color, href, icon: Icon, label, supporting, value }: MetricCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="h-1.5 w-8 rounded-full" style={{ background: color }} />
        {Icon ? <Icon size={20} style={{ color }} /> : null}
      </div>
      <div className="mt-5 min-w-0 break-words text-[clamp(1.25rem,1.8vw,1.75rem)] font-black leading-tight" style={{ color }}>
        {value}
      </div>
      <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      {supporting ? <p className="mt-2 text-sm font-bold leading-6 text-zinc-500">{supporting}</p> : null}
    </>
  );

  const className = "premium-card min-h-32 rounded-xl p-4 transition hover:border-white/14 hover:bg-white/[0.055]";

  if (href) {
    return (
      <Link className={className} href={href}>
        {content}
      </Link>
    );
  }

  return <article className={className}>{content}</article>;
}
