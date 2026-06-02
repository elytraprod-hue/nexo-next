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
  whatsapp?: string;
  role?: string;
  leadSource?: string;
  referral?: string;
  acquisitionChannel?: string;
  contactReason?: string;
  desiredService?: string;
  estimatedBudget?: number;
  assignedTo?: string;
  contactHistory: string[];
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

export type BusinessProfile = {
  name: string;
  legalName: string;
  documentNumber: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
  siteUrl: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialYoutube: string;
  defaultSignature: string;
  bankInfo: string;
  fiscalInfo: string;
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
  businessProfile: BusinessProfile;
  clients: ClientRecord[];
  projects: ProjectRecord[];
  documents: StudioDocumentRecord[];
  financeEntries: FinanceEntry[];
  privacyMode: boolean;
};

export const DEFAULT_BUSINESS_PROFILE: BusinessProfile = {
  name: "DNZ Films",
  legalName: "DNZ Films Produções Audiovisuais",
  documentNumber: "",
  logoUrl: "",
  address: "",
  phone: "",
  email: "elytraprod@gmail.com",
  siteUrl: "https://dnzcentral.com.br",
  socialInstagram: "@dnzfilms",
  socialLinkedin: "",
  socialYoutube: "",
  defaultSignature: "Equipe DNZ Films",
  bankInfo: "",
  fiscalInfo: "",
};

const today = new Date();

export function addDaysInput(days: number) {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createId(prefix: string) {
  void prefix;

  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();

  const random = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(1);
  return `${random()}${random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`;
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
  company?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: string;
  leadSource?: string;
  referral?: string;
  acquisitionChannel?: string;
  contactReason?: string;
  desiredService?: string;
  estimatedBudget?: number;
  status?: ClientRecord["status"];
  leadTemp?: ClientRecord["leadTemp"];
  payment?: ClientRecord["payment"];
  assignedTo?: string;
  notes?: string;
  contactHistory?: string[];
  relationshipType: RelationshipType;
  presetId: string;
  playbookId?: string;
  nextAction?: string;
  createdAt?: string;
}): ClientRecord {
  const preset = presetById(input.presetId);
  const playbook = NICHE_PLAYBOOKS.find((item) => item.id === input.playbookId);
  const value = playbook?.value ?? preset.value;
  const relationshipType = input.relationshipType;

  return {
    id: input.id ?? createId("client"),
    name: input.name.trim() || playbook?.niche || "Novo cliente",
    company: input.company?.trim() || playbook?.niche,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    whatsapp: input.whatsapp?.trim() || input.phone?.trim() || undefined,
    role: input.role?.trim() || undefined,
    leadSource: input.leadSource?.trim() || "Indicação",
    referral: input.referral?.trim() || undefined,
    acquisitionChannel: input.acquisitionChannel?.trim() || "WhatsApp",
    contactReason: input.contactReason?.trim() || playbook?.promise || preset.defaultBriefing.objective,
    desiredService: input.desiredService?.trim() || preset.service,
    estimatedBudget: input.estimatedBudget ?? value,
    assignedTo: input.assignedTo?.trim() || "Eu",
    contactHistory: input.contactHistory?.filter(Boolean) ?? [],
    relationshipType,
    status: input.status ?? (relationshipType === "freelancer" ? "ativo" : "lead"),
    leadTemp: input.leadTemp ?? (relationshipType === "recorrente" ? "quente" : "morno"),
    payment: input.payment ?? "pendente",
    service: preset.service,
    value,
    monthlyValue: relationshipType === "recorrente" ? value : undefined,
    partnerTerms: relationshipType === "parceria" ? "Permuta ou indicação a alinhar" : undefined,
    freelancerRole: relationshipType === "freelancer" ? "Captação / edição" : undefined,
    freelancerRate: relationshipType === "freelancer" ? value : undefined,
    nextAction: input.nextAction?.trim() || playbook?.nextAction || "Enviar proposta com escopo e próximo passo",
    notes: input.notes?.trim() || playbook?.promise,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function normalizeBusinessProfile(profile?: Partial<BusinessProfile>): BusinessProfile {
  return { ...DEFAULT_BUSINESS_PROFILE, ...(profile ?? {}) };
}

export function normalizeClient(client: ClientRecord): ClientRecord {
  return {
    ...client,
    whatsapp: client.whatsapp ?? client.phone,
    leadSource: client.leadSource ?? "Indicação",
    acquisitionChannel: client.acquisitionChannel ?? "WhatsApp",
    contactReason: client.contactReason ?? client.notes ?? "Contato comercial",
    desiredService: client.desiredService ?? client.service,
    estimatedBudget: client.estimatedBudget ?? client.monthlyValue ?? client.value,
    assignedTo: client.assignedTo ?? "Eu",
    contactHistory: client.contactHistory ?? [],
  };
}

export function normalizeWorkspaceState(state: Partial<WorkspaceState> | undefined): WorkspaceState {
  return {
    businessProfile: normalizeBusinessProfile(state?.businessProfile),
    clients: (state?.clients ?? INITIAL_WORKSPACE_STATE.clients).map(normalizeClient),
    projects: state?.projects ?? INITIAL_WORKSPACE_STATE.projects,
    documents: state?.documents ?? INITIAL_WORKSPACE_STATE.documents,
    financeEntries: state?.financeEntries ?? INITIAL_WORKSPACE_STATE.financeEntries,
    privacyMode: Boolean(state?.privacyMode),
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
  businessProfile: DEFAULT_BUSINESS_PROFILE,
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

export function getOperationalTimeline(state: WorkspaceState) {
  const projectEvents = state.projects.flatMap((project) => [
    {
      id: `${project.id}-deadline`,
      date: project.deadline,
      title: `Entrega: ${project.title}`,
      description: getClientName(state, project.clientId),
      type: "delivery" as const,
    },
    ...PRODUCTION_PIPELINE.filter((step) => project.pipeline[step.key]).map((step) => ({
      id: `${project.id}-${step.key}`,
      date: project.createdAt.slice(0, 10),
      title: `${step.label} concluído`,
      description: project.title,
      type: "production" as const,
    })),
  ]);

  const financeEvents = state.financeEntries.map((entry) => ({
    id: `${entry.id}-finance`,
    date: entry.dueAt,
    title: entry.type === "payable" ? `Pagar: ${entry.label}` : `Receber: ${entry.label}`,
    description: entry.type === "payable" ? "Saída prevista" : "Entrada prevista",
    type: entry.type === "payable" ? ("payable" as const) : ("receivable" as const),
  }));

  const documentEvents = state.documents.map((doc) => ({
    id: `${doc.id}-doc`,
    date: doc.createdAt.slice(0, 10),
    title: `Documento: ${doc.title}`,
    description: "Histórico salvo",
    type: "document" as const,
  }));

  return [...projectEvents, ...financeEvents, ...documentEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);
}

export function getWorkspaceAlerts(state: WorkspaceState) {
  const now = new Date("2026-06-02T00:00:00.000Z");
  const sevenDays = 1000 * 60 * 60 * 24 * 7;

  const receivables = state.financeEntries.filter((entry) => entry.type === "receivable" && entry.status !== "paid");
  const urgentProjects = state.projects.filter((project) => {
    const due = new Date(`${project.deadline}T00:00:00.000Z`);
    return due.getTime() - now.getTime() <= sevenDays && project.status !== "entregue";
  });

  return [
    ...receivables.map((entry) => ({
      id: `receivable-${entry.id}`,
      label: "Recebimento aberto",
      text: entry.label,
      tone: "money" as const,
    })),
    ...urgentProjects.map((project) => ({
      id: `project-${project.id}`,
      label: "Entrega próxima",
      text: project.title,
      tone: "deadline" as const,
    })),
    ...(state.documents.length === 0
      ? [
          {
            id: "missing-docs",
            label: "Documentação",
            text: "Gere o primeiro briefing ou proposta para criar histórico.",
            tone: "doc" as const,
          },
        ]
      : []),
  ].slice(0, 5);
}
