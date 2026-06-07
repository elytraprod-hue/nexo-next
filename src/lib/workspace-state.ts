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
  personType: "pessoa_fisica" | "empresa";
  company?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  siteUrl?: string;
  address?: string;
  primaryContact?: string;
  role?: string;
  leadSource?: string;
  referral?: string;
  acquisitionChannel?: string;
  contactReason?: string;
  desiredService?: string;
  estimatedBudget?: number;
  assignedTo?: string;
  contactHistory: string[];
  communicationHistory: string[];
  fileLinks: string[];
  tags: string[];
  relationshipType: RelationshipType;
  status: "lead" | "ativo" | "inativo" | "arquivado" | "pausado";
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
  briefing?: string;
  references: string[];
  shootDate?: string;
  deadline: string;
  deliveryDate: string;
  budget: number;
  crew: string[];
  priority: "baixa" | "normal" | "alta" | "urgente";
  link?: string;
  links: string[];
  pipeline: Record<PipelineKey, boolean>;
  checklist: { text: string; done: boolean }[];
  deliverables: { text: string; done: boolean }[];
  approvals: { label: string; status: "pendente" | "aprovado" | "ajuste"; createdAt: string }[];
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
  html?: string;
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

export type CommercialProposal = {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  presetId: string;
  scope: string;
  amount: number;
  status: "draft" | "sent" | "approved" | "lost" | "expired";
  validUntil: string;
  expectedCloseDate: string;
  lossReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
};

export type WorkspaceState = {
  businessProfile: BusinessProfile;
  clients: ClientRecord[];
  projects: ProjectRecord[];
  proposals: CommercialProposal[];
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
  briefing?: string;
  references?: string[];
  shootDate?: string;
  deadline?: string;
  deliveryDate?: string;
  budget?: number;
  crew?: string[];
  priority?: ProjectRecord["priority"];
  links?: string[];
  createdAt?: string;
}): ProjectRecord {
  const preset = presetById(input.presetId);
  const deliveryDate = input.deliveryDate || input.deadline || addDaysInput(14);

  return {
    id: input.id ?? createId("project"),
    clientId: input.clientId,
    title: input.title?.trim() || preset.title,
    presetId: preset.id,
    type: preset.type,
    status: "briefing",
    briefing: input.briefing?.trim() || preset.defaultBriefing.objective,
    references: input.references ?? [],
    shootDate: input.shootDate || undefined,
    deadline: deliveryDate,
    deliveryDate,
    budget: input.budget ?? preset.value,
    crew: input.crew ?? [],
    priority: input.priority ?? "normal",
    links: input.links ?? [],
    pipeline: pipelineInitialState(["briefing"]),
    checklist: preset.checklist.map((text) => ({ text, done: false })),
    deliverables: preset.deliverables.map((text) => ({ text, done: false })),
    approvals: [],
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function buildClient(input: {
  id?: string;
  name: string;
  personType?: ClientRecord["personType"];
  company?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  siteUrl?: string;
  address?: string;
  primaryContact?: string;
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
  communicationHistory?: string[];
  fileLinks?: string[];
  tags?: string[];
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
    personType: input.personType ?? (input.company ? "empresa" : "pessoa_fisica"),
    company: input.company?.trim() || playbook?.niche,
    documentNumber: input.documentNumber?.trim() || undefined,
    email: input.email?.trim() || undefined,
    phone: input.phone?.trim() || undefined,
    whatsapp: input.whatsapp?.trim() || input.phone?.trim() || undefined,
    instagram: input.instagram?.trim() || undefined,
    siteUrl: input.siteUrl?.trim() || undefined,
    address: input.address?.trim() || undefined,
    primaryContact: input.primaryContact?.trim() || input.name.trim() || undefined,
    role: input.role?.trim() || undefined,
    leadSource: input.leadSource?.trim() || "Indicação",
    referral: input.referral?.trim() || undefined,
    acquisitionChannel: input.acquisitionChannel?.trim() || "WhatsApp",
    contactReason: input.contactReason?.trim() || playbook?.promise || preset.defaultBriefing.objective,
    desiredService: input.desiredService?.trim() || preset.service,
    estimatedBudget: input.estimatedBudget ?? value,
    assignedTo: input.assignedTo?.trim() || "Eu",
    contactHistory: input.contactHistory?.filter(Boolean) ?? [],
    communicationHistory: input.communicationHistory?.filter(Boolean) ?? [],
    fileLinks: input.fileLinks?.filter(Boolean) ?? [],
    tags: input.tags?.filter(Boolean) ?? [],
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

export function buildProposal(input: {
  amount?: number;
  clientId: string;
  createdAt?: string;
  expectedCloseDate?: string;
  id?: string;
  lossReason?: string;
  notes?: string;
  presetId: string;
  projectId?: string;
  scope?: string;
  status?: CommercialProposal["status"];
  title?: string;
  updatedAt?: string;
  validUntil?: string;
}): CommercialProposal {
  const preset = presetById(input.presetId);
  const createdAt = input.createdAt ?? new Date().toISOString();

  return {
    id: input.id ?? createId("proposal"),
    clientId: input.clientId,
    projectId: input.projectId,
    title: input.title?.trim() || `Proposta - ${preset.title}`,
    presetId: preset.id,
    scope: input.scope?.trim() || `${preset.service}: ${preset.deliverables.join(", ")}`,
    amount: input.amount ?? preset.value,
    status: input.status ?? "draft",
    validUntil: input.validUntil || addDaysInput(7),
    expectedCloseDate: input.expectedCloseDate || addDaysInput(3),
    lossReason: input.lossReason?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt,
    updatedAt: input.updatedAt ?? createdAt,
  };
}

export function normalizeBusinessProfile(profile?: Partial<BusinessProfile>): BusinessProfile {
  return { ...DEFAULT_BUSINESS_PROFILE, ...(profile ?? {}) };
}

export function normalizeClient(client: ClientRecord): ClientRecord {
  return {
    ...client,
    personType: client.personType ?? (client.company ? "empresa" : "pessoa_fisica"),
    whatsapp: client.whatsapp ?? client.phone,
    primaryContact: client.primaryContact ?? client.name,
    leadSource: client.leadSource ?? "Indicação",
    acquisitionChannel: client.acquisitionChannel ?? "WhatsApp",
    contactReason: client.contactReason ?? client.notes ?? "Contato comercial",
    desiredService: client.desiredService ?? client.service,
    estimatedBudget: client.estimatedBudget ?? client.monthlyValue ?? client.value,
    assignedTo: client.assignedTo ?? "Eu",
    contactHistory: client.contactHistory ?? [],
    communicationHistory: client.communicationHistory ?? client.contactHistory ?? [],
    fileLinks: Array.isArray(client.fileLinks) ? client.fileLinks : client.fileLinks ? [String(client.fileLinks)] : [],
    tags: client.tags ?? [],
  };
}

export function normalizeProject(project: ProjectRecord): ProjectRecord {
  return {
    ...project,
    briefing: project.briefing ?? "",
    references: project.references ?? [],
    deliveryDate: project.deliveryDate ?? project.deadline,
    crew: project.crew ?? [],
    priority: project.priority ?? "normal",
    links: project.links ?? (project.link ? [project.link] : []),
    approvals: project.approvals ?? [],
  };
}

export function normalizeProposal(proposal: CommercialProposal): CommercialProposal {
  return {
    ...proposal,
    status: proposal.status ?? "draft",
    amount: Number(proposal.amount ?? 0),
    validUntil: proposal.validUntil ?? addDaysInput(7),
    expectedCloseDate: proposal.expectedCloseDate ?? addDaysInput(3),
  };
}

export function normalizeWorkspaceState(state: Partial<WorkspaceState> | undefined): WorkspaceState {
  return {
    businessProfile: normalizeBusinessProfile(state?.businessProfile),
    clients: (state?.clients ?? INITIAL_WORKSPACE_STATE.clients).map(normalizeClient),
    projects: (state?.projects ?? INITIAL_WORKSPACE_STATE.projects).map(normalizeProject),
    proposals: (state?.proposals ?? INITIAL_WORKSPACE_STATE.proposals).map(normalizeProposal),
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
  proposals: [
    buildProposal({
      id: "proposal-manifesto-institucional",
      clientId: firstClient.id,
      presetId: "institucional",
      title: "Proposta - Manifesto institucional",
      amount: 6350,
      status: "sent",
      expectedCloseDate: addDaysInput(4),
      validUntil: addDaysInput(9),
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
    state.proposals.length > 0,
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
  const proposalEvents = state.proposals
    .filter((proposal) => proposal.status === "draft" || proposal.status === "sent")
    .map((proposal) => ({
      id: `${proposal.id}-proposal`,
      date: proposal.expectedCloseDate,
      title: `Fechamento: ${proposal.title}`,
      description: `${getClientName(state, proposal.clientId)} · ${proposal.status === "sent" ? "enviada" : "rascunho"}`,
      type: "proposal" as const,
    }));

  return [...projectEvents, ...proposalEvents, ...financeEvents, ...documentEvents]
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
  const closingProposals = state.proposals.filter((proposal) => {
    if (proposal.status !== "draft" && proposal.status !== "sent") return false;
    const closeDate = new Date(`${proposal.expectedCloseDate}T00:00:00.000Z`);
    return closeDate.getTime() - now.getTime() <= sevenDays;
  });

  return [
    ...closingProposals.map((proposal) => ({
      id: `proposal-${proposal.id}`,
      label: "Proposta para fechar",
      text: `${proposal.title} · ${getClientName(state, proposal.clientId)}`,
      tone: "commercial" as const,
    })),
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
