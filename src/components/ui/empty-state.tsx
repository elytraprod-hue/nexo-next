import type { ComponentType } from "react";

type EmptyStateProps = {
  action?: React.ReactNode;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  label?: string;
  title: string;
};

export function EmptyState({ action, description, icon: Icon, label, title }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.025] p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-xl border border-white/10 bg-white/[0.045] text-orange-300">
        <Icon size={22} />
      </span>
      {label ? <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-orange-300">{label}</p> : null}
      <h3 className="mt-2 text-xl font-black leading-tight">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-zinc-500">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
