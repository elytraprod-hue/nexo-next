import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Surface } from "@/components/ui/surface";
import { getWorkspaceAlerts, type WorkspaceState } from "@/lib/workspace-state";

const toneColor = {
  money: "#facc15",
  deadline: "var(--orange)",
  doc: "var(--cyan)",
};

type SmartAlertsProps = {
  state: WorkspaceState;
};

export function SmartAlerts({ state }: SmartAlertsProps) {
  const alerts = getWorkspaceAlerts(state);

  return (
    <Surface>
      <div className="flex items-center gap-3">
        <AlertCircle className="text-orange-400" />
        <h2 className="text-xl font-black">Alertas inteligentes</h2>
      </div>
      <div className="mt-5 grid gap-3">
        {alerts.map((alert) => (
          <Link key={alert.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.08]" href={alert.tone === "doc" ? "/studio" : alert.tone === "money" ? "/financeiro" : "/projetos"}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: toneColor[alert.tone] }}>
                  {alert.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{alert.text}</p>
              </div>
              <ArrowRight className="shrink-0 text-zinc-600" size={18} />
            </div>
          </Link>
        ))}
      </div>
    </Surface>
  );
}
