import { CalendarDays, FileText, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { formatDate } from "@/lib/utils/format";
import { getOperationalTimeline, type WorkspaceState } from "@/lib/workspace-state";

const colors = {
  delivery: "var(--orange)",
  production: "var(--violet)",
  payable: "#fb7185",
  receivable: "#facc15",
  document: "var(--cyan)",
};

type OperationsTimelineProps = {
  state: WorkspaceState;
};

export function OperationsTimeline({ state }: OperationsTimelineProps) {
  const events = getOperationalTimeline(state);

  return (
    <Surface>
      <div className="flex items-center gap-3">
        <CalendarDays className="text-orange-400" />
        <h2 className="text-xl font-black">Timeline da operação</h2>
      </div>
      <div className="mt-5 grid gap-3">
        {events.map((event) => (
          <article key={event.id} className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 md:grid-cols-[130px_1fr_auto] md:items-center">
            <Badge color={colors[event.type]}>{formatDate(event.date)}</Badge>
            <div>
              <h3 className="font-black">{event.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">{event.description}</p>
            </div>
            {event.type === "document" ? <FileText className="text-cyan-300" size={18} /> : <WalletCards className="text-zinc-600" size={18} />}
          </article>
        ))}
      </div>
    </Surface>
  );
}
