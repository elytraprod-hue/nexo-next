"use client";

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
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Surface>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge color="#facc15">Visão financeira</Badge>
              <h2 className="mt-4 max-w-2xl text-4xl font-black leading-[0.95] sm:text-5xl">Entenda a operação em poucos segundos.</h2>
            </div>
            <Button variant="ghost" onClick={actions.togglePrivacy}>
              {privacy ? <Eye size={17} /> : <EyeOff size={17} />}
              {privacy ? "Mostrar valores" : "Ocultar valores"}
            </Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <article key={card.label} className="min-h-44 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Icon size={24} style={{ color: card.color }} />
                    <span className="h-2 w-9 rounded-full" style={{ background: card.color }} />
                  </div>
                  <p
                    className="mt-7 max-w-full break-words text-[clamp(2rem,4vw,3.25rem)] font-black leading-[0.95]"
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
                <article key={entry.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
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
        <div className="mt-5 grid gap-3">
          {state.financeEntries.map((entry) => (
            <article key={entry.id} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_160px_140px_120px] md:items-center">
              <div>
                <h3 className="font-black">{entry.label}</h3>
                <p className="mt-1 text-sm text-zinc-500">{getClientName(state, entry.clientId)}</p>
              </div>
              <p className="font-black">{formatCurrency(entry.amount, privacy)}</p>
              <p className="text-sm text-zinc-400">{formatDate(entry.dueAt)}</p>
              <Badge color={entry.status === "paid" ? "var(--green)" : entry.type === "payable" ? "#fb7185" : "#facc15"}>
                {entry.status === "paid" ? "Pago" : entry.type === "payable" ? "A pagar" : "Aberto"}
              </Badge>
            </article>
          ))}
        </div>
      </Surface>
    </AppShell>
  );
}
