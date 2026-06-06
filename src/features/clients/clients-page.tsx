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
  X,
} from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import { AUDIOVISUAL_PRESETS, NICHE_PLAYBOOKS, RELATIONSHIP_TYPES, type RelationshipType } from "@/lib/constants";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency } from "@/lib/utils/format";
import { addDaysInput, getClientName, type ClientRecord } from "@/lib/workspace-state";

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
  inativo: "Inativo",
  arquivado: "Arquivado",
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
  personType: ClientRecord["personType"];
  company: string;
  documentNumber: string;
  role: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  siteUrl: string;
  address: string;
  primaryContact: string;
  leadSource: string;
  referral: string;
  acquisitionChannel: string;
  contactReason: string;
  estimatedBudget: string;
  assignedTo: string;
  status: ClientRecord["status"];
  leadTemp: ClientRecord["leadTemp"];
  tags: string;
  notes: string;
  contactHistory: string;
  communicationHistory: string;
  fileLinks: string;
};

const initialDraft: ClientDraft = {
  name: "",
  personType: "empresa",
  company: "",
  documentNumber: "",
  role: "",
  email: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  siteUrl: "",
  address: "",
  primaryContact: "",
  leadSource: "Indicação",
  referral: "",
  acquisitionChannel: "WhatsApp",
  contactReason: "Quer orçamento",
  estimatedBudget: "",
  assignedTo: "Eu",
  status: "lead",
  leadTemp: "morno",
  tags: "",
  notes: "",
  contactHistory: "",
  communicationHistory: "",
  fileLinks: "",
};

function parseMoney(value: string, fallback: number) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function splitList(value: string) {
  return value
    .split(/[,;\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function maskDocument(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
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
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("identidade");
  const [draft, setDraft] = useState<ClientDraft>(initialDraft);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("cliente");
  const [presetId, setPresetId] = useState("institucional");
  const [quickAction, setQuickAction] = useState("Enviar proposta com escopo, investimento e próximo passo");
  const [lastCreatedClient, setLastCreatedClient] = useState<ClientRecord | null>(null);
  const [lastProjectTitle, setLastProjectTitle] = useState("");
  const [proposalClientId, setProposalClientId] = useState(state.clients[0]?.id ?? "");
  const [proposalPresetId, setProposalPresetId] = useState("institucional");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalScope, setProposalScope] = useState("");
  const [proposalAmount, setProposalAmount] = useState("");
  const [proposalExpectedClose, setProposalExpectedClose] = useState(addDaysInput(3));
  const [proposalValidUntil, setProposalValidUntil] = useState(addDaysInput(7));
  const [lastProposalTitle, setLastProposalTitle] = useState("");

  const filteredClients = useMemo(
    () => (segment === "todos" ? state.clients : state.clients.filter((client) => client.relationshipType === segment)),
    [segment, state.clients],
  );
  const selectedPreset = AUDIOVISUAL_PRESETS.find((preset) => preset.id === presetId) ?? AUDIOVISUAL_PRESETS[1];
  const selectedProposalPreset = AUDIOVISUAL_PRESETS.find((preset) => preset.id === proposalPresetId) ?? AUDIOVISUAL_PRESETS[1];
  const completedCore = [draft.name, draft.whatsapp || draft.phone || draft.email, draft.leadSource, quickAction].filter(Boolean).length;
  const hasContactPath = Boolean(draft.whatsapp || draft.phone || draft.email);
  const canCreateClient = ready && Boolean(draft.name.trim()) && hasContactPath && Boolean(draft.primaryContact.trim() || draft.personType === "pessoa_fisica");
  const openProposals = state.proposals.filter((proposal) => proposal.status === "draft" || proposal.status === "sent");
  const forecastAmount = openProposals.reduce((sum, proposal) => sum + proposal.amount, 0);

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
      personType: type === "freelancer" ? "pessoa_fisica" : draft.personType,
      contactReason: type === "parceria" ? "Parceria/permutas" : type === "recorrente" ? "Precisa recorrência" : draft.contactReason,
    });
  }

  function addGuidedClient() {
    if (!canCreateClient) return;
    const client = actions.addClient({
      name: draft.name,
      personType: draft.personType,
      company: draft.company,
      documentNumber: draft.documentNumber,
      role: draft.role,
      email: draft.email,
      phone: draft.phone,
      whatsapp: draft.whatsapp,
      instagram: draft.instagram,
      siteUrl: draft.siteUrl,
      address: draft.address,
      primaryContact: draft.primaryContact || draft.name,
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
      communicationHistory: splitList(draft.communicationHistory),
      fileLinks: splitList(draft.fileLinks),
      tags: splitList(draft.tags),
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
    setClientModalOpen(false);
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
      communicationHistory: [`Modelo aplicado: ${nextAction}`],
      tags: [playbook.niche, preset.label],
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

  function removeClient(client: ClientRecord) {
    const confirmed = window.confirm(`Excluir ${client.name}? Projetos, financeiro e documentos vinculados também serão removidos.`);
    if (!confirmed) return;
    actions.removeClient(client.id);
  }

  function createProposal() {
    if (!ready || !proposalClientId) return;
    const proposal = actions.addProposal({
      clientId: proposalClientId,
      presetId: proposalPresetId,
      title: proposalTitle,
      scope: proposalScope,
      amount: parseMoney(proposalAmount, selectedProposalPreset.value),
      expectedCloseDate: proposalExpectedClose,
      validUntil: proposalValidUntil,
      status: "sent",
    });
    setLastProposalTitle(proposal.title);
    setProposalTitle("");
    setProposalScope("");
    setProposalAmount("");
    setProposalExpectedClose(addDaysInput(3));
    setProposalValidUntil(addDaysInput(7));
  }

  function convertProposal(proposalId: string) {
    if (!ready) return;
    const project = actions.convertProposalToProject(proposalId);
    if (project) setLastProjectTitle(project.title);
  }

  return (
    <AppShell
      eyebrow="Nexus comercial"
      primaryAction={{ href: "/projetos", label: "Criar projeto" }}
      subtitle="Cadastro completo em etapas, modelos de nicho e próxima ação pronta para virar produção."
      title="Comercial"
    >
      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex items-start gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-500/15 text-orange-300">
                <UserRoundPlus size={20} />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Cadastro guiado</p>
                <h2 className="mt-2 text-xl font-black leading-tight">Criar cliente em uma janela própria</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">A página fica limpa e o formulário completo abre focado, por etapas.</p>
              </div>
            </div>
            <Button className="mt-5 w-full" disabled={!ready} onClick={() => setClientModalOpen(true)}>
              <Plus size={17} />
              Novo cliente
            </Button>
            {!canCreateClient && draft.name ? (
              <p className="mt-3 text-xs font-bold leading-5 text-zinc-500">Rascunho em andamento: complete nome, contato e responsável para salvar.</p>
            ) : null}
          </Surface>

          {clientModalOpen ? (
            <div className="workspace-overlay fixed inset-0 z-50 grid place-items-center p-3 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Novo contato guiado">
              <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto">
                <Surface className="workspace-window border-orange-400/20">
            <div className="flex items-center gap-3">
              <UserRoundPlus className="text-orange-400" />
              <h2 className="text-xl font-black">Novo contato guiado</h2>
              <button
                className="premium-control ml-auto grid size-10 place-items-center rounded-lg text-zinc-400 transition hover:text-white"
                type="button"
                aria-label="Fechar cadastro"
                onClick={() => setClientModalOpen(false)}
              >
                <X size={17} />
              </button>
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
                    <Field label="Tipo">
                      <select
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                        value={draft.personType}
                        onChange={(event) => patchDraft({ personType: event.target.value as ClientRecord["personType"] })}
                      >
                        <option value="empresa">Empresa</option>
                        <option value="pessoa_fisica">Pessoa física</option>
                      </select>
                    </Field>
                    <Field label="CPF/CNPJ">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder={draft.personType === "empresa" ? "00.000.000/0001-00" : "000.000.000-00"}
                        value={draft.documentNumber}
                        onChange={(event) => patchDraft({ documentNumber: maskDocument(event.target.value) })}
                      />
                    </Field>
                    <Field label="Nome">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder={draft.personType === "empresa" ? "Nome do cliente ou marca" : "Nome completo"}
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
                    <Field label="Responsável principal">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Quem aprova, responde ou decide"
                        value={draft.primaryContact}
                        onChange={(event) => patchDraft({ primaryContact: event.target.value })}
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
                        onChange={(event) => patchDraft({ whatsapp: maskPhone(event.target.value) })}
                      />
                    </Field>
                    <Field label="Telefone">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Telefone alternativo"
                        value={draft.phone}
                        onChange={(event) => patchDraft({ phone: maskPhone(event.target.value) })}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Field label="E-mail">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="contato@cliente.com"
                        type="email"
                        value={draft.email}
                        onChange={(event) => patchDraft({ email: event.target.value })}
                      />
                    </Field>
                    <Field label="Instagram">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="@cliente"
                        value={draft.instagram}
                        onChange={(event) => patchDraft({ instagram: event.target.value })}
                      />
                    </Field>
                    <Field label="Site/portfólio">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="https://..."
                        value={draft.siteUrl}
                        onChange={(event) => patchDraft({ siteUrl: event.target.value })}
                      />
                    </Field>
                    <Field label="Endereço">
                      <input
                        className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                        placeholder="Cidade, UF ou endereço completo"
                        value={draft.address}
                        onChange={(event) => patchDraft({ address: event.target.value })}
                      />
                    </Field>
                  </div>
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
                        <option value="lead">Lead</option>
                        <option value="ativo">Cliente ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="arquivado">Arquivado</option>
                      </select>
                    </Field>
                  </div>
                  <Field label="Tags">
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                      placeholder="Ex: recorrente, clínica, alto ticket"
                      value={draft.tags}
                      onChange={(event) => patchDraft({ tags: event.target.value })}
                    />
                  </Field>
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
                  <Field label="Histórico de comunicação">
                    <textarea
                      className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                      placeholder="Cole mensagens, alinhamentos ou follow-ups importantes. Uma linha por evento."
                      value={draft.communicationHistory}
                      onChange={(event) => patchDraft({ communicationHistory: event.target.value })}
                    />
                  </Field>
                  <Field label="Arquivos vinculados">
                    <textarea
                      className="focus-ring min-h-24 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                      placeholder="Links de Drive, referências, pastas ou arquivos. Um por linha."
                      value={draft.fileLinks}
                      onChange={(event) => patchDraft({ fileLinks: event.target.value })}
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
              <Button disabled={!canCreateClient} onClick={addGuidedClient}>
                <Plus size={17} />
                {ready ? "Criar contato completo" : "Restaurando"}
              </Button>
            </div>
            {!canCreateClient ? (
              <p className="mt-3 text-xs font-bold leading-5 text-zinc-500">Preencha pelo menos nome e um canal de contato para criar sem gerar carteira solta.</p>
            ) : null}
                </Surface>
              </div>
            </div>
          ) : null}

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

        <div className="grid gap-4">
          <Surface>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Pipeline comercial</p>
                <h2 className="mt-2 text-2xl font-black">Propostas e orçamentos</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-zinc-500">Crie proposta, acompanhe previsão e converta aprovado em projeto sem redigitar.</p>
              </div>
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-right">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">Previsão aberta</p>
                <p className="mt-1 text-xl font-black text-emerald-200">{formatCurrency(forecastAmount, state.privacyMode)}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr]">
              <div className="grid gap-3 rounded-xl border border-white/10 bg-black/18 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Cliente">
                    <select
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                      value={proposalClientId}
                      onChange={(event) => setProposalClientId(event.target.value)}
                    >
                      {state.clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Serviço">
                    <select
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/40 px-4 text-sm font-bold normal-case tracking-normal text-white"
                      value={proposalPresetId}
                      onChange={(event) => {
                        setProposalPresetId(event.target.value);
                        const preset = AUDIOVISUAL_PRESETS.find((item) => item.id === event.target.value);
                        if (preset) setProposalAmount(String(preset.value));
                      }}
                    >
                      {AUDIOVISUAL_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Título">
                  <input
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                    placeholder={`Proposta - ${selectedProposalPreset.title}`}
                    value={proposalTitle}
                    onChange={(event) => setProposalTitle(event.target.value)}
                  />
                </Field>
                <Field label="Escopo">
                  <textarea
                    className="focus-ring min-h-28 rounded-lg border border-white/10 bg-black/20 p-3 text-sm font-bold leading-6 text-white placeholder:text-zinc-600"
                    placeholder={`${selectedProposalPreset.service}: ${selectedProposalPreset.deliverables.join(", ")}`}
                    value={proposalScope}
                    onChange={(event) => setProposalScope(event.target.value)}
                  />
                </Field>
                <div className="grid gap-3 md:grid-cols-3">
                  <Field label="Valor">
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                      placeholder={String(selectedProposalPreset.value)}
                      value={proposalAmount}
                      onChange={(event) => setProposalAmount(event.target.value)}
                    />
                  </Field>
                  <Field label="Fechamento provável">
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white"
                      type="date"
                      value={proposalExpectedClose}
                      onChange={(event) => setProposalExpectedClose(event.target.value)}
                    />
                  </Field>
                  <Field label="Validade">
                    <input
                      className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white"
                      type="date"
                      value={proposalValidUntil}
                      onChange={(event) => setProposalValidUntil(event.target.value)}
                    />
                  </Field>
                </div>
                <Button disabled={!ready || !proposalClientId} onClick={createProposal}>
                  <Plus size={17} />
                  Criar proposta
                </Button>
                {lastProposalTitle ? <p className="text-sm font-black text-emerald-300">Proposta criada: {lastProposalTitle}</p> : null}
              </div>

              <div className="grid content-start gap-3">
                {state.proposals.length ? (
                  state.proposals.slice(0, 6).map((proposal) => (
                    <article key={proposal.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <Badge color={proposal.status === "approved" ? "var(--green)" : proposal.status === "lost" ? "#ef4444" : "var(--orange)"}>
                            {proposal.status === "draft" ? "rascunho" : proposal.status === "sent" ? "enviada" : proposal.status === "approved" ? "aprovada" : proposal.status === "lost" ? "perdida" : "expirada"}
                          </Badge>
                          <h3 className="mt-3 font-black">{proposal.title}</h3>
                          <p className="mt-1 text-sm text-zinc-500">{getClientName(state, proposal.clientId)}</p>
                        </div>
                        <p className="text-lg font-black text-emerald-300">{formatCurrency(proposal.amount, state.privacyMode)}</p>
                      </div>
                      <p className="mt-3 text-sm font-bold leading-6 text-zinc-400">{proposal.scope}</p>
                      <div className="mt-4 grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-500 md:grid-cols-2">
                        <span>Fecha: {new Date(proposal.expectedCloseDate).toLocaleDateString("pt-BR")}</span>
                        <span>Validade: {new Date(proposal.validUntil).toLocaleDateString("pt-BR")}</span>
                      </div>
                      {proposal.status !== "approved" ? (
                        <Button className="mt-4" disabled={!ready} variant="success" onClick={() => convertProposal(proposal.id)}>
                          Converter em projeto
                          <ArrowRight size={17} />
                        </Button>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <EmptyState
                    description="Crie a primeira proposta para transformar conversa em previsão comercial e projeto aprovado."
                    icon={BriefcaseBusiness}
                    label="Comercial"
                    title="Nenhuma proposta ainda"
                  />
                )}
              </div>
            </div>
          </Surface>

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
            {filteredClients.length ? filteredClients.map((client) => {
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
                        onClick={() => removeClient(client)}
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
                        ["Tipo", client.personType === "empresa" ? "Empresa" : "Pessoa física"],
                        ["CPF/CNPJ", client.documentNumber || "Não informado"],
                        ["Responsável", client.primaryContact || client.name],
                        ["Papel na decisão", client.role || "Não informado"],
                        ["Instagram", client.instagram || "Não informado"],
                        ["Site", client.siteUrl || "Não informado"],
                        ["Endereço", client.address || "Não informado"],
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
                    {client.tags.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {client.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {client.contactHistory.length ? (
                      <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Histórico comercial</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-zinc-300">{client.contactHistory.join(" · ")}</p>
                      </div>
                    ) : null}
                    {client.communicationHistory.length ? (
                      <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Comunicação</p>
                        <p className="mt-1 text-sm font-bold leading-6 text-zinc-300">{client.communicationHistory.join(" · ")}</p>
                      </div>
                    ) : null}
                    {client.fileLinks.length ? (
                      <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Arquivos vinculados</p>
                        <div className="mt-2 grid gap-2">
                          {client.fileLinks.map((link) => (
                            <a key={link} className="break-all text-sm font-bold leading-6 text-cyan-300 hover:text-cyan-100" href={link} rel="noopener noreferrer" target="_blank">
                              {link}
                            </a>
                          ))}
                        </div>
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
            }) : (
              <EmptyState
                description="Use o cadastro guiado ou um modelo de nicho. O contato já nasce com serviço, origem, temperatura e próxima ação."
                icon={UserRoundPlus}
                label="Carteira"
                title="Nenhum contato neste filtro"
              />
            )}
          </div>
          </Surface>
        </div>
      </section>
    </AppShell>
  );
}
