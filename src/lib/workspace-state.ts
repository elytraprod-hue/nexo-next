import {
  NICHE_PLAYBOOKS,
  PRODUCTION_PIPELINE,
  type PipelineKey,
  type RelationshipType,
  type StudioDocId,
  presetById,
} from "@/lib/constants";

export type ClientRecord = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  relationshipType: RelationshipType;
  status: "lead" | "ativo" | "pausado";
  leadTemp: "frio" | "morno" | "quente";
  payment: "pendente" | "parcial" | "ok";
  service: string;
  value: number;
  monthlyValue?: number;
  partnerTerms?: string;
  freelancerRole?: string;
  freelancerRate?: number;
  nextAction: string;
  notes?: string;
  createdAt: string;
};

export type ProjectRecord = {
  id: string;
  clientId: string;
  title: string;
  presetId: string;
  type: string;
  status: "briefing" | "producao" | "review" | "entregue";
  deadline: string;
  budget: number;
  link?: string;
  pipeline: Record<PipelineKey, boolean>;
  checklist: { text: string; done: boolean }[];
  deliverables: { text: string; done: boolean }[];
  createdAt: string;
};

export type StudioDocumentRecord = {
  id: string;
  docType: StudioDocId;
  title: string;
  clientId?: string;
  projectId?: string;
  presetId: string;
  payload: Record<string, string>;
  summary: string;
  createdAt: string;
};

export type FinanceEntry = {
  id: string;
  label: string;
  type: "receivable" | "payable" | "received";
  amount: number;
  status: "open" | "paid" | "late";
  dueAt: string;
  clientId?: string;
  projectId?: string;
};

export type WorkspaceState = {
  clients: ClientRecord[];
  projects: ProjectRecord[];
  documents: StudioDocumentRecord[];
  financeEntries: FinanceEntry[];
  privacyMode: boolean;
};

const today = new Date();

export function addDaysInput(days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function pipelineInitialState(done: PipelineKey[] = []) {
  return Object.fromEntries(PRODUCTION_PIPELINE.map((step) => [step.key, done.includes(step.key)])) as Record<PipelineKey, boolean>;
}

export function buildProject(input: {
  id?: string;
  clientId: string;
  presetId: string;
  title?: string;
  deadline?: string;
  budget?: number;
  createdAt?: string;
}): ProjectRecord {
  const preset = presetById(input.presetId);

  return {
    id: input.id ?? createId("project"),
    clientId: input.clientId,
    title: input.title?.trim() || preset.title,
    presetId: preset.id,
    type: preset.type,
    status: "briefing",
    deadline: input.deadline || addDaysInput(14),
    budget: input.budget ?? preset.value,
    pipeline: pipelineInitialState(["briefing"]),
    checklist: preset.checklist.map((text) => ({ text, done: false })),
    deliverables: preset.deliverables.map((text) => ({ text, done: false })),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function buildClient(input: {
  id?: string;
  name: string;
  relationshipType: RelationshipType;
  presetId: string;
  playbookId?: string;
  createdAt?: string;
}): ClientRecord {
  const preset = presetById(input.presetId);
  const playbook = NICHE_PLAYBOOKS.find((item) => item.id === input.playbookId);
  const value = playbook?.value ?? preset.value;
  const relationshipType = input.relationshipType;

  return {
    id: input.id ?? createId("client"),
    name: input.name.trim() || playbook?.niche || "Novo cliente",
    company: playbook?.niche,
    relationshipType,
    status: relationshipType === "freelancer" ? "ativo" : "lead",
    leadTemp: relationshipType === "recorrente" ? "quente" : "morno",
    payment: "pendente",
    service: preset.service,
    value,
    monthlyValue: relationshipType === "recorrente" ? value : undefined,
    partnerTerms: relationshipType === "parceria" ? "Permuta ou indicação a alinhar" : undefined,
    freelancerRole: relationshipType === "freelancer" ? "Captação / edição" : undefined,
    freelancerRate: relationshipType === "freelancer" ? value : undefined,
    nextAction: playbook?.nextAction ?? "Enviar proposta com escopo e próximo passo",
    notes: playbook?.promise,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function buildDocumentSummary(input: {
  docLabel: string;
  tone: string;
  clientName: string;
  projectTitle: string;
  presetTitle: string;
  payload: Record<string, string>;
}) {
  const filled = Object.entries(input.payload).filter(([, value]) => value.trim());
  const lines = [
    `${input.docLabel} para ${input.clientName}`,
    `Projeto: ${input.projectTitle}`,
    `Base audiovisual: ${input.presetTitle}`,
    `Direção do documento: ${input.tone}`,
    "",
    "Informações principais:",
    ...(filled.length ? filled.map(([key, value]) => `- ${key}: ${value}`) : ["- Documento criado com presets; complete apenas o que for necessário."]),
  ];

  return lines.join("\n");
}

const firstClient = buildClient({
  id: "client-dnz-films",
  name: "DNZ Films",
  relationshipType: "recorrente",
  presetId: "institucional",
  playbookId: "evento",
  createdAt: "2026-06-02T00:00:00.000Z",
});

const secondClient = buildClient({
  id: "client-clinica-aurora",
  name: "Clínica Aurora",
  relationshipType: "cliente",
  presetId: "reel",
  playbookId: "clinica",
  createdAt: "2026-06-02T00:00:00.000Z",
});

const firstProject = buildProject({
  id: "project-manifesto-institucional",
  clientId: firstClient.id,
  presetId: "institucional",
  title: "Manifesto institucional",
  deadline: "2026-06-12",
  budget: 6350,
  createdAt: "2026-06-02T00:00:00.000Z",
});

firstProject.pipeline.roteiro = true;
firstProject.pipeline.decupagem = true;
firstProject.status = "producao";
firstProject.checklist[0].done = true;
firstProject.checklist[1].done = true;

export const INITIAL_WORKSPACE_STATE: WorkspaceState = {
  clients: [firstClient, secondClient],
  projects: [
    firstProject,
    buildProject({
      id: "project-reels-autoridade",
      clientId: secondClient.id,
      presetId: "reel",
      title: "Reels de autoridade",
      deadline: "2026-06-08",
      budget: 2400,
      createdAt: "2026-06-02T00:00:00.000Z",
    }),
  ],
  documents: [],
  financeEntries: [
    {
      id: createId("finance"),
      label: "Manifesto institucional - entrada",
      type: "received",
      amount: 3200,
      status: "paid",
      dueAt: "2026-05-31",
      clientId: firstClient.id,
      projectId: firstProject.id,
    },
    {
      id: createId("finance"),
      label: "Manifesto institucional - entrega",
      type: "receivable",
      amount: 3150,
      status: "open",
      dueAt: "2026-06-12",
      clientId: firstClient.id,
      projectId: firstProject.id,
    },
    {
      id: createId("finance"),
      label: "Editor freelancer",
      type: "payable",
      amount: 900,
      status: "open",
      dueAt: "2026-06-09",
      projectId: firstProject.id,
    },
  ],
  privacyMode: false,
};

export function calculateMaturity(state: WorkspaceState) {
  const checks = [
    state.clients.length > 0,
    state.projects.length > 0,
    state.projects.some((project) => Object.values(project.pipeline).some(Boolean)),
    state.financeEntries.length > 0,
    state.documents.length > 0,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function getClientName(state: WorkspaceState, clientId?: string) {
  return state.clients.find((client) => client.id === clientId)?.name ?? "Cliente sem nome";
}
