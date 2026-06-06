"use client";

import { useState } from "react";
import { Eye, EyeOff, Landmark, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { getClientName } from "@/lib/workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function FinancePage() {
  const { state, metrics, actions } = useWorkspaceState();
  const privacy = state.privacyMode;
  const [selectedEntryId, setSelectedEntryId] = useState(state.financeEntries[0]?.id ?? "");
  const selectedEntry = state.financeEntries.find((entry) => entry.id === selectedEntryId) ?? state.financeEntries[0] ?? null;

  const cards = [
    { label: "A receber", value: metrics.receivable, color: "#facc15", icon: TrendingUp },
    { label: "Recebido", value: metrics.received, color: "var(--green)", icon: Landmark },
    { label: "A pagar", value: metrics.payable, color: "#fb7185", icon: TrendingDown },
    { label: "Lucro previsto", value: metrics.expectedProfit, color: "var(--cyan)", icon: WalletCards },
  ];

  return (
    <AppShell
      eyebrow="Financeiro"
      primaryAction={{ href: "/clientes", label: "Novo cliente" }}
      subtitle="Leitura rápida para criativos: receber, pagar, recebido e lucro previsto sem planilha pesada."
      title="Financeiro simples"
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Surface className="border-emerald-300/12 bg-emerald-300/[0.035]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge color="#facc15">Visão financeira</Badge>
              <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">Entenda a operação em poucos segundos.</h2>
            </div>
            <Button variant="ghost" onClick={actions.togglePrivacy}>
              {privacy ? <Eye size={17} /> : <EyeOff size={17} />}
              {privacy ? "Mostrar valores" : "Ocultar valores"}
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.label} className="premium-card min-h-34 overflow-hidden rounded-xl p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Icon size={24} style={{ color: card.color }} />
                    <span className="h-1.5 w-8 rounded-full" style={{ background: card.color }} />
                  </div>
                  <p
                    className="mt-5 max-w-full break-words text-[clamp(1.45rem,2.4vw,2.05rem)] font-black leading-tight"
                    style={{ color: card.color }}
                  >
                    {formatCurrency(card.value, privacy)}
                  </p>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{card.label}</p>
                </article>
              );
            })}
          </div>
        </Surface>

        <Surface>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Próximo financeiro</p>
          <div className="mt-5 grid gap-3">
            {state.financeEntries
              .filter((entry) => entry.status !== "paid")
              .slice(0, 5)
              .map((entry) => (
                <article key={entry.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge color={entry.type === "payable" ? "#fb7185" : "#facc15"}>{entry.type === "payable" ? "A pagar" : "A receber"}</Badge>
                      <h3 className="mt-3 font-black">{entry.label}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{getClientName(state, entry.clientId)}</p>
                    </div>
                    <p className="text-right text-lg font-black text-zinc-100">{formatCurrency(entry.amount, privacy)}</p>
                  </div>
                  <p className="mt-3 text-sm text-zinc-500">Vence em {formatDate(entry.dueAt)}</p>
                </article>
              ))}
          </div>
        </Surface>
      </section>

      <Surface>
        <div className="flex items-center gap-3">
          <WalletCards className="text-emerald-300" />
          <h2 className="text-xl font-black">Lançamentos</h2>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid content-start gap-2">
            {state.financeEntries.map((entry) => {
              const active = selectedEntry?.id === entry.id;
              return (
                <button
                  key={entry.id}
                  className={`focus-ring grid gap-3 rounded-xl border p-4 text-left transition md:grid-cols-[1fr_150px_130px] md:items-center ${active ? "border-emerald-300/45 bg-emerald-300/10" : "border-white/10 bg-black/20 hover:bg-white/[0.045]"}`}
                  type="button"
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div>
                    <h3 className="font-black">{entry.label}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{getClientName(state, entry.clientId)}</p>
                  </div>
                  <p className="font-black">{formatCurrency(entry.amount, privacy)}</p>
                  <Badge color={entry.status === "paid" ? "var(--green)" : entry.type === "payable" ? "#fb7185" : "#facc15"}>
                    {entry.status === "paid" ? "Pago" : entry.type === "payable" ? "A pagar" : entry.status === "late" ? "Atrasado" : "Aberto"}
                  </Badge>
                </button>
              );
            })}
          </div>

          {selectedEntry ? (
            <aside className="premium-card rounded-2xl p-5">
              <Badge color={selectedEntry.status === "paid" ? "var(--green)" : selectedEntry.type === "payable" ? "#fb7185" : "#facc15"}>
                {selectedEntry.status === "paid" ? "Pago" : selectedEntry.type === "payable" ? "A pagar" : selectedEntry.status === "late" ? "Atrasado" : "Aberto"}
              </Badge>
              <h3 className="mt-4 text-2xl font-black leading-tight">{selectedEntry.label}</h3>
              <p className="mt-2 text-sm font-bold text-zinc-500">{getClientName(state, selectedEntry.clientId)}</p>
              <p className="mt-6 text-4xl font-black text-emerald-300">{formatCurrency(selectedEntry.amount, privacy)}</p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Vencimento</p>
                  <p className="mt-1 text-sm font-bold text-zinc-300">{formatDate(selectedEntry.dueAt)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Tipo</p>
                  <p className="mt-1 text-sm font-bold text-zinc-300">{selectedEntry.type === "payable" ? "Saída" : "Entrada"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Projeto</p>
                  <p className="mt-1 text-sm font-bold text-zinc-300">{state.projects.find((project) => project.id === selectedEntry.projectId)?.title ?? "Não vinculado"}</p>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </Surface>
    </AppShell>
  );
}
