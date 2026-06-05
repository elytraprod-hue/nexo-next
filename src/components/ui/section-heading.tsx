import type { ComponentType } from "react";

type SectionHeadingProps = {
  action?: React.ReactNode;
  description?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  kicker?: string;
  title: string;
};

export function SectionHeading({ action, description, icon: Icon, kicker, title }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="shrink-0 text-orange-300" size={20} /> : null}
          {kicker ? <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{kicker}</p> : null}
        </div>
        <h2 className="mt-2 text-2xl font-black leading-tight">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-zinc-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
