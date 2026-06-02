"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2, UserRoundPlus, WandSparkles } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, NICHE_PLAYBOOKS, RELATIONSHIP_TYPES, type RelationshipType } from "@/lib/constants";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency } from "@/lib/utils/format";

export function ClientsPage() {
  const { state, actions } = useWorkspaceState();
  const [segment, setSegment] = useState<RelationshipType | "todos">("todos");
  const [name, setName] = useState("");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("cliente");
  const [presetId, setPresetId] = useState("institucional");

  const filteredClients = useMemo(
    () => (segment === "todos" ? state.clients : state.clients.filter((client) => client.relationshipType === segment)),
    [segment, state.clients],
  );

  function addGuidedClient() {
    const client = actions.addClient({ name, relationshipType, presetId });
    setName("");
    setRelationshipType(client.relationshipType);
    setPresetId(AUDIOVISUAL_PRESETS.find((preset) => preset.service === client.service)?.id ?? presetId);
  }

  return (
    <AppShell
      eyebrow="Nexus comercial"
      primaryAction={{ href: "/projetos", label: "Criar projeto" }}
      subtitle="Clientes, recorrentes, parcerias/permutas e freelancers no mesmo lugar, com menos digitação."
      title="Comercial"
    >
      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-3">
              <UserRoundPlus className="text-orange-400" />
              <h2 className="text-xl font-black">Novo contato guiado</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-500">Escolha o tipo, selecione o serviço e escreva só o nome se quiser.</p>

            <div className="mt-5 grid gap-3">
              <input
                className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                placeholder="Nome do cliente, parceiro ou freelancer"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />

              <div className="grid grid-cols-2 gap-2">
                {RELATIONSHIP_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={`focus-ring min-h-14 rounded-2xl border px-3 text-left text-xs font-black transition ${
                      relationshipType === type.id ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/10 bg-white/[0.045] text-zinc-400"
                    }`}
                    type="button"
                    onClick={() => setRelationshipType(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {AUDIOVISUAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    className={`focus-ring rounded-2xl border p-3 text-left transition ${
                      presetId === preset.id ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"
                    }`}
                    type="button"
                    onClick={() => setPresetId(preset.id)}
                  >
                    <p className="text-sm font-black">{preset.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatCurrency(preset.value, state.privacyMode)}</p>
                  </button>
                ))}
              </div>

              <Button className="w-full" onClick={addGuidedClient}>
                <Plus size={17} />
                Criar contato
              </Button>
            </div>
          </Surface>

          <Surface>
            <div className="flex items-center gap-3">
              <WandSparkles className="text-cyan-300" />
              <h2 className="text-xl font-black">Playbooks de nicho</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {NICHE_PLAYBOOKS.map((playbook) => (
                <button
                  key={playbook.id}
                  className="focus-ring rounded-3xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-cyan-300/30 hover:bg-cyan-300/10"
                  type="button"
                  onClick={() =>
                    actions.addClient({
                      name: playbook.niche,
                      relationshipType: "cliente",
                      presetId: playbook.presetId,
                      playbookId: playbook.id,
                    })
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black">{playbook.niche}</h3>
                    <Badge color="var(--cyan)">1 clique</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{playbook.promise}</p>
                </button>
              ))}
            </div>
          </Surface>
        </div>

        <Surface>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Carteira</p>
              <h2 className="mt-2 text-3xl font-black">{filteredClients.length} contatos</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-2xl px-3 py-2 text-xs font-black ${segment === "todos" ? "bg-orange-500 text-black" : "bg-white/[0.06] text-zinc-400"}`}
                type="button"
                onClick={() => setSegment("todos")}
              >
                Todos
              </button>
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`rounded-2xl px-3 py-2 text-xs font-black ${segment === type.id ? "bg-orange-500 text-black" : "bg-white/[0.06] text-zinc-400"}`}
                  type="button"
                  onClick={() => setSegment(type.id)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredClients.map((client) => {
              const relation = RELATIONSHIP_TYPES.find((item) => item.id === client.relationshipType);

              return (
                <article key={client.id} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge color={relation?.color}>{relation?.label}</Badge>
                        <Badge color={client.leadTemp === "quente" ? "var(--green)" : "var(--orange)"}>{client.leadTemp}</Badge>
                        <Badge color={client.payment === "ok" ? "var(--green)" : "#facc15"}>{client.payment}</Badge>
                      </div>
                      <h3 className="mt-4 text-2xl font-black">{client.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{client.service}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Valor base</p>
                        <p className="mt-1 text-xl font-black text-emerald-300">{formatCurrency(client.monthlyValue ?? client.value, state.privacyMode)}</p>
                      </div>
                      <button
                        aria-label={`Excluir ${client.name}`}
                        className="grid size-11 place-items-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
                        type="button"
                        onClick={() => actions.removeClient(client.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Próxima ação</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{client.nextAction}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </Surface>
      </section>
    </AppShell>
  );
}
