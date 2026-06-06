"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, Eye, EyeOff, Landmark, Plus, TrendingDown, TrendingUp, WalletCards, X } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { addDaysInput, getClientName, type FinanceEntry } from "@/lib/workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

type FinanceDraft = {
  amount: string;
  clientId: string;
  dueAt: string;
  label: string;
  projectId: string;
  status: FinanceEntry["status"];
  type: FinanceEntry["type"];
};

function entryStatusLabel(entry: FinanceEntry) {
  if (entry.status === "paid") return "Pago";
  if (entry.status === "late") return "Atrasado";
  if (entry.type === "payable") return "A pagar";
  return "A receber";
}

function parseMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized || 0);
}

export function FinancePage() {
  const { state, metrics, actions } = useWorkspaceState();
  const privacy = state.privacyMode;
  const [selectedEntryId, setSelectedEntryId] = useState(state.financeEntries[0]?.id ?? "");
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<FinanceDraft>({
    amount: "",
    clientId: state.clients[0]?.id ?? "",
    dueAt: addDaysInput(7),
    label: "",
    projectId: "",
    status: "open",
    type: "receivable",
  });

  const sortedEntries = useMemo(
    () => [...state.financeEntries].sort((a, b) => a.dueAt.localeCompare(b.dueAt)),
    [state.financeEntries],
  );
  const openEntries = sortedEntries.filter((entry) => entry.status !== "paid");
  const selectedEntry = state.financeEntries.find((entry) => entry.id === selectedEntryId) ?? openEntries[0] ?? state.financeEntries[0] ?? null;
  const nextEntry = openEntries[0] ?? null;
  const overdueCount = state.financeEntries.filter((entry) => entry.status === "late").length;

  const cashCards = [
    { label: "Entradas abertas", value: metrics.receivable, color: "#facc15", icon: TrendingUp },
    { label: "Recebido", value: metrics.received, color: "var(--green)", icon: Landmark },
    { label: "Saídas abertas", value: metrics.payable, color: "#fb7185", icon: TrendingDown },
    { label: "Lucro previsto", value: metrics.expectedProfit, color: "var(--cyan)", icon: WalletCards },
  ];

  function updateDraft(input: Partial<FinanceDraft>) {
    setDraft((current) => ({ ...current, ...input }));
  }

  function createEntry() {
    if (!draft.label.trim() || !draft.amount.trim()) return;
    const entry = actions.addFinanceEntry({
      amount: parseMoney(draft.amount),
      clientId: draft.clientId || undefined,
      dueAt: draft.dueAt,
      label: draft.label.trim(),
      projectId: draft.projectId || undefined,
      status: draft.status,
      type: draft.type,
    });
    setSelectedEntryId(entry.id);
    setModalOpen(false);
    setDraft({
      amount: "",
      clientId: state.clients[0]?.id ?? "",
      dueAt: addDaysInput(7),
      label: "",
      projectId: "",
      status: "open",
      type: "receivable",
    });
  }

  return (
    <AppShell
      eyebrow="Financeiro"
      primaryAction={{ href: "/financeiro", label: "Novo lançamento" }}
      subtitle="Entradas, saídas, vencimentos e margem da operação."
      title="Receber"
    >
      {modalOpen ? (
        <div className="workspace-overlay fixed inset-0 z-50 grid place-items-center p-3 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Novo lançamento financeiro">
          <div className="w-full max-w-3xl">
            <Surface className="workspace-window border-emerald-300/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Badge color={draft.type === "payable" ? "#fb7185" : "var(--green)"}>{draft.type === "payable" ? "Saída" : "Entrada"}</Badge>
                  <h2 className="mt-3 text-2xl font-black">Novo lançamento</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">Registre cobrança, pagamento, vencimento e vínculo com cliente/projeto.</p>
                </div>
                <button className="premium-control grid size-11 place-items-center rounded-lg text-zinc-400 hover:text-white" type="button" onClick={() => setModalOpen(false)} aria-label="Fechar financeiro">
                  <X size={17} />
                </button>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Tipo
                  <select className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/35 px-4 text-sm font-bold normal-case tracking-normal text-white" value={draft.type} onChange={(event) => updateDraft({ type: event.target.value as FinanceEntry["type"] })}>
                    <option value="receivable">Entrada a receber</option>
                    <option value="received">Entrada recebida</option>
                    <option value="payable">Saída a pagar</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Status
                  <select className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/35 px-4 text-sm font-bold normal-case tracking-normal text-white" value={draft.status} onChange={(event) => updateDraft({ status: event.target.value as FinanceEntry["status"] })}>
                    <option value="open">Aberto</option>
                    <option value="paid">Pago</option>
                    <option value="late">Atrasado</option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500 md:col-span-2">
                  Descrição
                  <input className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white" placeholder="Ex: Entrada campanha institucional" value={draft.label} onChange={(event) => updateDraft({ label: event.target.value })} />
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Valor
                  <input className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white" placeholder="6350,00" value={draft.amount} onChange={(event) => updateDraft({ amount: event.target.value })} />
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Vencimento
                  <input className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white" type="date" value={draft.dueAt} onChange={(event) => updateDraft({ dueAt: event.target.value })} />
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Cliente
                  <select className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/35 px-4 text-sm font-bold normal-case tracking-normal text-white" value={draft.clientId} onChange={(event) => updateDraft({ clientId: event.target.value })}>
                    <option value="">Sem cliente</option>
                    {state.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                  Projeto
                  <select className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/35 px-4 text-sm font-bold normal-case tracking-normal text-white" value={draft.projectId} onChange={(event) => updateDraft({ projectId: event.target.value })}>
                    <option value="">Sem projeto</option>
                    {state.projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button disabled={!draft.label.trim() || !draft.amount.trim()} onClick={createEntry}>
                  <Plus size={17} />
                  Salvar lançamento
                </Button>
              </div>
            </Surface>
          </div>
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Surface className="border-white/[0.075] bg-white/[0.026]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge color="#facc15">Caixa operacional</Badge>
              <h2 className="mt-3 text-2xl font-black leading-tight">O que entra, o que sai e o que precisa de cobrança.</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={actions.togglePrivacy}>
                {privacy ? <Eye size={17} /> : <EyeOff size={17} />}
                {privacy ? "Mostrar valores" : "Ocultar valores"}
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus size={17} />
                Lançamento
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cashCards.map((card) => {
              const Icon = card.icon;
              return (
                <article key={card.label} className="rounded-[16px] border border-white/[0.075] bg-black/24 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Icon size={22} style={{ color: card.color }} />
                    <span className="h-1.5 w-8 rounded-full" style={{ background: card.color }} />
                  </div>
                  <p className="mt-4 truncate text-2xl font-black leading-tight" style={{ color: card.color }}>{formatCurrency(card.value, privacy)}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{card.label}</p>
                </article>
              );
            })}
          </div>
        </Surface>

        <Surface className={overdueCount ? "border-red-400/20 bg-red-400/[0.04]" : "border-emerald-300/16 bg-emerald-300/[0.04]"}>
          <div className="flex items-center gap-3">
            {overdueCount ? <AlertTriangle className="text-red-300" /> : <CheckCircle2 className="text-emerald-300" />}
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Próxima ação</p>
              <h3 className="mt-1 text-xl font-black">{nextEntry ? entryStatusLabel(nextEntry) : "Fluxo em dia"}</h3>
            </div>
          </div>
          {nextEntry ? (
            <button className="mt-5 w-full rounded-[16px] border border-white/10 bg-black/24 p-4 text-left transition hover:bg-white/[0.05]" type="button" onClick={() => setSelectedEntryId(nextEntry.id)}>
              <p className="text-sm font-black text-white">{nextEntry.label}</p>
              <p className="mt-2 text-sm text-zinc-500">{getClientName(state, nextEntry.clientId)} · vence {formatDate(nextEntry.dueAt)}</p>
              <p className="mt-4 text-2xl font-black text-yellow-300">{formatCurrency(nextEntry.amount, privacy)}</p>
            </button>
          ) : (
            <p className="mt-5 text-sm leading-6 text-zinc-500">Nenhuma cobrança ou saída aberta. Crie lançamentos para manter previsibilidade.</p>
          )}
        </Surface>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <WalletCards className="text-emerald-300" />
              <h2 className="text-xl font-black">Lançamentos</h2>
            </div>
            <button className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-black text-zinc-400" type="button" onClick={() => setModalOpen(true)}>
              Adicionar
            </button>
          </div>

          <div className="mt-5 grid gap-2">
            {sortedEntries.length ? sortedEntries.map((entry) => {
              const active = selectedEntry?.id === entry.id;
              const color = entry.status === "paid" ? "var(--green)" : entry.type === "payable" ? "#fb7185" : entry.status === "late" ? "#ef4444" : "#facc15";
              return (
                <button
                  key={entry.id}
                  className={`focus-ring grid gap-3 rounded-[14px] border p-4 text-left transition md:grid-cols-[minmax(0,1fr)_150px_120px] md:items-center ${active ? "border-emerald-300/45 bg-emerald-300/10" : "border-white/10 bg-black/18 hover:bg-white/[0.045]"}`}
                  type="button"
                  onClick={() => setSelectedEntryId(entry.id)}
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-black">{entry.label}</h3>
                    <p className="mt-1 text-sm text-zinc-500">{getClientName(state, entry.clientId)} · {formatDate(entry.dueAt)}</p>
                  </div>
                  <p className="font-black" style={{ color }}>{formatCurrency(entry.amount, privacy)}</p>
                  <Badge color={color}>{entryStatusLabel(entry)}</Badge>
                </button>
              );
            }) : (
              <div className="rounded-[16px] border border-dashed border-white/10 p-8 text-center">
                <p className="text-lg font-black">Nenhum lançamento financeiro</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Crie uma entrada ou saída para conectar proposta, entrega e recebimento.</p>
                <Button className="mt-5" onClick={() => setModalOpen(true)}>
                  <Plus size={17} />
                  Criar lançamento
                </Button>
              </div>
            )}
          </div>
        </Surface>

        {selectedEntry ? (
          <aside className="xl:sticky xl:top-24">
            <Surface className="border-white/[0.075] bg-white/[0.035]">
              <Badge color={selectedEntry.status === "paid" ? "var(--green)" : selectedEntry.type === "payable" ? "#fb7185" : selectedEntry.status === "late" ? "#ef4444" : "#facc15"}>
                {entryStatusLabel(selectedEntry)}
              </Badge>
              <h3 className="mt-4 text-2xl font-black leading-tight">{selectedEntry.label}</h3>
              <p className="mt-2 text-sm font-bold text-zinc-500">{getClientName(state, selectedEntry.clientId)}</p>
              <p className="mt-6 text-4xl font-black text-emerald-300">{formatCurrency(selectedEntry.amount, privacy)}</p>
              <div className="mt-6 grid gap-3">
                {[
                  ["Vencimento", formatDate(selectedEntry.dueAt), CalendarDays],
                  ["Tipo", selectedEntry.type === "payable" ? "Saída" : "Entrada", WalletCards],
                  ["Projeto", state.projects.find((project) => project.id === selectedEntry.projectId)?.title ?? "Não vinculado", Landmark],
                ].map(([label, value, Icon]) => {
                  const DetailIcon = Icon as typeof CalendarDays;
                  return (
                    <div key={String(label)} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                        <DetailIcon size={15} />
                        {label as string}
                      </div>
                      <p className="mt-2 text-sm font-bold text-zinc-300">{value as string}</p>
                    </div>
                  );
                })}
              </div>
            </Surface>
          </aside>
        ) : null}
      </section>
    </AppShell>
  );
}
