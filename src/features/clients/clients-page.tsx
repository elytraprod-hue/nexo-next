"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ContactRound,
  History,
  Mail,
  Phone,
  Plus,
  Target,
  Trash2,
  UserRoundPlus,
  WandSparkles,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, NICHE_PLAYBOOKS, RELATIONSHIP_TYPES, type RelationshipType } from "@/lib/constants";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency } from "@/lib/utils/format";
import { addDaysInput, type ClientRecord } from "@/lib/workspace-state";

const relationshipDefaultPreset: Record<RelationshipType, string> = {
  cliente: "institucional",
  recorrente: "stories",
  parceria: "evento",
  freelancer: "edicao",
};

const leadSources = ["Indicação", "Instagram", "WhatsApp", "Site", "Evento", "Prospecção ativa"];
const acquisitionChannels = ["WhatsApp", "Instagram", "E-mail", "Ligação", "Reunião", "Formulário"];
const contactReasons = ["Quer orçamento", "Precisa recorrência", "Aprovação de proposta", "Parceria/permutas", "Produção urgente", "Banco de fornecedores"];
const attentionOwners = ["Eu", "Produtor responsável", "Sócio comercial", "Atendimento externo"];
const statusLabels: Record<ClientRecord["status"], string> = {
  lead: "Em conversa",
  ativo: "Ativo",
  pausado: "Pausado",
};
const stepMeta = [
  { id: "identidade", label: "Identidade", icon: Building2 },
  { id: "contato", label: "Contato", icon: ContactRound },
  { id: "comercial", label: "Comercial", icon: Target },
  { id: "historico", label: "Histórico", icon: History },
] as const;

type StepId = (typeof stepMeta)[number]["id"];

type ClientDraft = {
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
  leadSource: string;
  referral: string;
  acquisitionChannel: string;
  contactReason: string;
  estimatedBudget: string;
  assignedTo: string;
  status: ClientRecord["status"];
  leadTemp: ClientRecord["leadTemp"];
  notes: string;
  contactHistory: string;
};

const initialDraft: ClientDraft = {
  name: "",
  company: "",
  role: "",
  email: "",
  phone: "",
  whatsapp: "",
  leadSource: "Indicação",
  referral: "",
  acquisitionChannel: "WhatsApp",
  contactReason: "Quer orçamento",
  estimatedBudget: "",
  assignedTo: "Eu",
  status: "lead",
  leadTemp: "morno",
  notes: "",
  contactHistory: "",
};

function parseMoney(value: string, fallback: number) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function ChipGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          className={`focus-ring rounded-lg border px-3 py-2 text-xs font-black transition ${
            value === option ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/10 bg-white/[0.045] text-zinc-400 hover:text-white"
          }`}
          type="button"
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function ClientsPage() {
  const { state, actions, ready } = useWorkspaceState();
  const [segment, setSegment] = useState<RelationshipType | "todos">("todos");
  const [activeStep, setActiveStep] = useState<StepId>("identidade");
  const [draft, setDraft] = useState<ClientDraft>(initialDraft);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("cliente");
  const [presetId, setPresetId] = useState("institucional");
  const [quickAction, setQuickAction] = useState("Enviar proposta com escopo, investimento e próximo passo");
  const [lastCreatedClient, setLastCreatedClient] = useState<ClientRecord | null>(null);
  const [lastProjectTitle, setLastProjectTitle] = useState("");

  const filteredClients = useMemo(
    () => (segment === "todos" ? state.clients : state.clients.filter((client) => client.relationshipType === segment)),
    [segment, state.clients],
  );
  const selectedPreset = AUDIOVISUAL_PRESETS.find((preset) => preset.id === presetId) ?? AUDIOVISUAL_PRESETS[1];
  const completedCore = [draft.name, draft.whatsapp || draft.phone || draft.email, draft.leadSource, quickAction].filter(Boolean).length;

  function patchDraft(input: Partial<ClientDraft>) {
    setDraft((current) => ({ ...current, ...input }));
  }

  function presetIdForClientService(service: string) {
    return AUDIOVISUAL_PRESETS.find((preset) => preset.service === service)?.id ?? presetId;
  }

  function chooseRelationship(type: RelationshipType) {
    setRelationshipType(type);
    setPresetId(relationshipDefaultPreset[type]);
    setQuickAction(
      type === "recorrente"
        ? "Enviar plano mensal com entregas, datas fixas e rotina de aprovação"
        : type === "parceria"
          ? "Definir contrapartida, entrega esperada e limite de uso"
          : type === "freelancer"
            ? "Confirmar disponibilidade, diária, função no set e forma de entrega"
            : "Enviar proposta com escopo, investimento e próximo passo",
    );
    patchDraft({
      status: type === "freelancer" ? "ativo" : "lead",
      leadTemp: type === "recorrente" ? "quente" : "morno",
      contactReason: type === "parceria" ? "Parceria/permutas" : type === "recorrente" ? "Precisa recorrência" : draft.contactReason,
    });
  }

  function addGuidedClient() {
    if (!ready) return;
    const client = actions.addClient({
      name: draft.name,
      company: draft.company,
      role: draft.role,
      email: draft.email,
      phone: draft.phone,
      whatsapp: draft.whatsapp,
      leadSource: draft.leadSource,
      referral: draft.referral,
      acquisitionChannel: draft.acquisitionChannel,
      contactReason: draft.contactReason,
      desiredService: selectedPreset.service,
      estimatedBudget: parseMoney(draft.estimatedBudget, selectedPreset.value),
      assignedTo: draft.assignedTo,
      status: draft.status,
      leadTemp: draft.leadTemp,
      notes: draft.notes,
      contactHistory: draft.contactHistory ? [draft.contactHistory] : [],
      relationshipType,
      presetId,
      nextAction: quickAction,
    });
    setDraft(initialDraft);
    setLastProjectTitle("");
    setLastCreatedClient(client);
    setSegment(client.relationshipType);
    setRelationshipType(client.relationshipType);
    setPresetId(AUDIOVISUAL_PRESETS.find((preset) => preset.service === client.service)?.id ?? presetId);
    setQuickAction(client.nextAction);
  }

  function addPlaybookClient(playbookId: (typeof NICHE_PLAYBOOKS)[number]["id"], nextAction: string) {
    if (!ready) return;
    const playbook = NICHE_PLAYBOOKS.find((item) => item.id === playbookId);
    if (!playbook) return;

    const preset = AUDIOVISUAL_PRESETS.find((item) => item.id === playbook.presetId) ?? selectedPreset;
    const client = actions.addClient({
      name: playbook.niche,
      company: playbook.niche,
      relationshipType: "cliente",
      presetId: playbook.presetId,
      playbookId: playbook.id,
      nextAction,
      contactReason: playbook.promise,
      desiredService: preset.service,
      estimatedBudget: playbook.value,
      leadSource: "Modelo NEXO",
      acquisitionChannel: "Prospecção ativa",
      assignedTo: "Eu",
      notes: playbook.promise,
      contactHistory: [`Modelo aplicado: ${nextAction}`],
    });
    setLastProjectTitle("");
    setLastCreatedClient(client);
    setSegment("cliente");
    setPresetId(playbook.presetId);
    setQuickAction(client.nextAction);
  }

  function createProjectForClient(client: ClientRecord) {
    if (!ready) return;

    const projectPresetId = presetIdForClientService(client.service);
    const preset = AUDIOVISUAL_PRESETS.find((item) => item.id === projectPresetId) ?? selectedPreset;
    const project = actions.addProject({
      clientId: client.id,
      presetId: projectPresetId,
      title: `${preset.title} - ${client.name}`,
      deadline: addDaysInput(projectPresetId === "stories" ? 5 : projectPresetId === "doc" ? 21 : 14),
      budget: client.estimatedBudget ?? client.monthlyValue ?? client.value,
    });
    setLastProjectTitle(project.title);
  }

  return (
    <AppShell
      eyebrow="Nexus comercial"
      primaryAction={{ href: "/projetos", label: "Criar projeto" }}
      subtitle="Cadastro completo em etapas, modelos de nicho e próxima ação pronta para virar produção."
      title="Comercial"
    >
      <section className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex items-center gap-3">
              <UserRoundPlus className="text-orange-400" />
              <h2 className="text-xl font-black">Novo contato guiado</h2>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              {stepMeta.map((step, index) => {
                const Icon = step.icon;
                return (
                  <button
                    key={step.id}
                    className={`focus-ring rounded-lg border p-3 text-left text-[11px] font-black uppercase tracking-[0.12em] transition ${
                      activeStep === step.id ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/10 bg-white/[0.04] text-zinc-500"
                    }`}
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                  >
                    <Icon className="mb-2" size={16} />
                    0{index + 1}<br />{step.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/18 p-4">
              {activeStep === "identidade" ? (
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    {RELATIONSHIP_TYPES.map((type) => (
                      <button
                        key={type.id}
                        className={`focus-ring min-h-14 rounded-lg border px-3 text-left text-xs font-black transition ${
                          relationshipType === type.id ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/10 bg-white/[0.045] text-zinc-400"
                        }`}
                        type="button"
                        onClick={() => chooseRelationship(type.id)}
                      >
                        <span className="block">{type.label}</span>
                        <span className="mt-1 block text-[11px] font-bold leading-4 opacity-70">{type.description}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Nome">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Nome do contato"
                        value={draft.name}
                        onChange={(event) => patchDraft({ name: event.target.value })}
                      />
                    </Field>
                    <Field label="Empresa">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Marca, produtora ou cliente"
                        value={draft.company}
                        onChange={(event) => patchDraft({ company: event.target.value })}
                      />
                    </Field>
                    <Field label="Papel na decisão">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Dono, marketing, agência, produtor..."
                        value={draft.role}
                        onChange={(event) => patchDraft({ role: event.target.value })}
                      />
                    </Field>
                    <Field label="Atendimento por">
                      <select
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                        value={draft.assignedTo}
                        onChange={(event) => patchDraft({ assignedTo: event.target.value })}
                      >
                        {attentionOwners.map((owner) => (
                          <option key={owner}>{owner}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              ) : null}

              {activeStep === "contato" ? (
                <div className="grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="WhatsApp">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="(00) 00000-0000"
                        value={draft.whatsapp}
                        onChange={(event) => patchDraft({ whatsapp: event.target.value })}
                      />
                    </Field>
                    <Field label="Telefone">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Telefone alternativo"
                        value={draft.phone}
                        onChange={(event) => patchDraft({ phone: event.target.value })}
                      />
                    </Field>
                  </div>
                  <Field label="E-mail">
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                      placeholder="contato@cliente.com"
                      type="email"
                      value={draft.email}
                      onChange={(event) => patchDraft({ email: event.target.value })}
                    />
                  </Field>
                  <div className="grid gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Canal de aquisição</p>
                    <ChipGroup options={acquisitionChannels} value={draft.acquisitionChannel} onChange={(value) => patchDraft({ acquisitionChannel: value })} />
                  </div>
                </div>
              ) : null}

              {activeStep === "comercial" ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Serviço desejado</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {AUDIOVISUAL_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          className={`focus-ring rounded-lg border p-3 text-left transition ${
                            presetId === preset.id ? "border-cyan-300 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"
                          }`}
                          type="button"
                          onClick={() => {
                            setPresetId(preset.id);
                            patchDraft({ estimatedBudget: String(preset.value) });
                          }}
                        >
                          <p className="text-sm font-black">{preset.label}</p>
                          <p className="mt-1 text-xs text-zinc-500">{formatCurrency(preset.value, state.privacyMode)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Orçamento estimado">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder={String(selectedPreset.value)}
                        value={draft.estimatedBudget}
                        onChange={(event) => patchDraft({ estimatedBudget: event.target.value })}
                      />
                    </Field>
                    <Field label="Status">
                      <select
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                        value={draft.status}
                        onChange={(event) => patchDraft({ status: event.target.value as ClientRecord["status"] })}
                      >
                        <option value="lead">Em conversa</option>
                        <option value="ativo">Ativo</option>
                        <option value="pausado">Pausado</option>
                      </select>
                    </Field>
                  </div>
                  <div className="grid gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Origem do contato</p>
                    <ChipGroup options={leadSources} value={draft.leadSource} onChange={(value) => patchDraft({ leadSource: value })} />
                  </div>
                  <div className="grid gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Motivo do contato</p>
                    <ChipGroup options={contactReasons} value={draft.contactReason} onChange={(value) => patchDraft({ contactReason: value })} />
                  </div>
                  <Field label="Indicação">
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                      placeholder="Quem indicou ou abriu a porta"
                      value={draft.referral}
                      onChange={(event) => patchDraft({ referral: event.target.value })}
                    />
                  </Field>
                </div>
              ) : null}

              {activeStep === "historico" ? (
                <div className="grid gap-3">
                  <Field label="Próxima ação">
                    <textarea
                      className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                      value={quickAction}
                      onChange={(event) => setQuickAction(event.target.value)}
                    />
                  </Field>
                  <Field label="Histórico de contato">
                    <textarea
                      className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                      placeholder="Resumo da conversa, reunião ou contexto"
                      value={draft.contactHistory}
                      onChange={(event) => patchDraft({ contactHistory: event.target.value })}
                    />
                  </Field>
                  <Field label="Observações">
                    <textarea
                      className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                      placeholder="Restrições, preferências, risco comercial ou oportunidade"
                      value={draft.notes}
                      onChange={(event) => patchDraft({ notes: event.target.value })}
                    />
                  </Field>
                </div>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Perfil operacional</p>
                <p className="mt-2 text-sm font-bold text-zinc-300">{completedCore}/4 sinais preenchidos · {selectedPreset.service}</p>
              </div>
              <Button disabled={!ready} onClick={addGuidedClient}>
                <Plus size={17} />
                {ready ? "Criar contato completo" : "Restaurando"}
              </Button>
            </div>
          </Surface>

          {lastCreatedClient ? (
            <Surface className="border-emerald-300/20 bg-emerald-300/[0.06]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 shrink-0 text-emerald-300" size={20} />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Contato pronto</p>
                  <h3 className="mt-2 text-xl font-black">{lastCreatedClient.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{lastProjectTitle || "Próximo melhor passo: abrir uma produção já com briefing, pipeline e checklist."}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Button disabled={!ready} variant="success" onClick={() => createProjectForClient(lastCreatedClient)}>
                  <BriefcaseBusiness size={17} />
                  Criar projeto agora
                </Button>
                <Button variant="ghost" onClick={() => setSegment(lastCreatedClient.relationshipType)}>
                  Ver carteira
                  <ArrowRight size={17} />
                </Button>
              </div>
            </Surface>
          ) : null}

          <Surface>
            <div className="flex items-center gap-3">
              <WandSparkles className="text-cyan-300" />
              <h2 className="text-xl font-black">Modelos de nicho</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {NICHE_PLAYBOOKS.map((playbook) => (
                <article key={playbook.id} className="rounded-xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/10">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-black">{playbook.niche}</h3>
                    <Badge color="var(--cyan)">Pronto</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{playbook.promise}</p>
                  <div className="mt-3 grid gap-2">
                    {playbook.nextActions.map((action) => (
                      <button
                        key={action}
                        className="focus-ring rounded-lg border border-white/10 bg-black/20 p-3 text-left text-xs font-bold leading-5 text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                        disabled={!ready}
                        type="button"
                        onClick={() => addPlaybookClient(playbook.id, action)}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Surface>
        </div>

        <Surface>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Carteira</p>
              <h2 className="mt-2 text-2xl font-black">{filteredClients.length} contatos</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className={`rounded-lg px-3 py-2 text-xs font-black ${segment === "todos" ? "bg-orange-500 text-black" : "bg-white/[0.06] text-zinc-400"}`}
                type="button"
                onClick={() => setSegment("todos")}
              >
                Todos
              </button>
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`rounded-lg px-3 py-2 text-xs font-black ${segment === type.id ? "bg-orange-500 text-black" : "bg-white/[0.06] text-zinc-400"}`}
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
                <article key={client.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        <Badge color={relation?.color}>{relation?.label}</Badge>
                        <Badge color={client.leadTemp === "quente" ? "var(--green)" : "var(--orange)"}>{client.leadTemp}</Badge>
                        <Badge color={client.payment === "ok" ? "var(--green)" : "#facc15"}>{statusLabels[client.status]}</Badge>
                      </div>
                      <h3 className="mt-3 break-words text-xl font-black">{client.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{client.company || client.service}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Estimativa</p>
                        <p className="mt-1 max-w-40 truncate text-xl font-black text-emerald-300">
                          {formatCurrency(client.estimatedBudget ?? client.monthlyValue ?? client.value, state.privacyMode)}
                        </p>
                      </div>
                      <button
                        aria-label={`Excluir ${client.name}`}
                        className="grid size-10 place-items-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-300 transition hover:bg-red-400/20"
                        type="button"
                        onClick={() => actions.removeClient(client.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <Phone className="text-cyan-300" size={17} />
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Contato</p>
                      <p className="mt-1 break-words text-sm font-bold text-zinc-300">{client.whatsapp || client.phone || "Sem telefone"}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <Mail className="text-violet-300" size={17} />
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">E-mail</p>
                      <p className="mt-1 break-words text-sm font-bold text-zinc-300">{client.email || "Não informado"}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
                      <Target className="text-orange-300" size={17} />
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Origem</p>
                      <p className="mt-1 break-words text-sm font-bold text-zinc-300">{client.leadSource}</p>
                    </div>
                  </div>

                  <details className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
                    <summary className="cursor-pointer text-sm font-black text-zinc-300">Perfil completo</summary>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {[
                        ["Papel na decisão", client.role || "Não informado"],
                        ["Canal", client.acquisitionChannel || "Não informado"],
                        ["Motivo", client.contactReason || "Não informado"],
                        ["Serviço desejado", client.desiredService || client.service],
                        ["Indicação", client.referral || "Não informado"],
                        ["Atendimento por", client.assignedTo || "Não informado"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                          <p className="mt-1 text-sm font-bold leading-6 text-zinc-300">{value}</p>
                        </div>
                      ))}
                    </div>
                    {client.contactHistory.length ? (
                      <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Histórico</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-zinc-300">{client.contactHistory.join(" · ")}</p>
                      </div>
                    ) : null}
                  </details>

                  <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-300">Próxima ação</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-300">{client.nextAction}</p>
                    <Button className="mt-4" disabled={!ready} variant="ghost" onClick={() => createProjectForClient(client)}>
                      <BriefcaseBusiness size={17} />
                      Criar projeto
                    </Button>
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
