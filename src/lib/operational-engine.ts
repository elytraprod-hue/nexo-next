import { PRODUCTION_PIPELINE } from "@/lib/constants";
import { getClientName, type WorkspaceState } from "@/lib/workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export type OperationalEntityType = "lead" | "proposal" | "project" | "document" | "review" | "delivery" | "finance" | "activity" | "notification";
export type OperationalPriority = "low" | "normal" | "high" | "urgent";

export type OperationalAction = {
  id: string;
  type: OperationalEntityType;
  priority: OperationalPriority;
  title: string;
  description: string;
  href: string;
  cta: string;
  dueAt?: string;
};

export type OperationalEvent = {
  id: string;
  type: OperationalEntityType;
  title: string;
  description: string;
  href: string;
  date: string;
  status?: string;
};

function daysUntil(date?: string) {
  if (!date) return Number.POSITIVE_INFINITY;
  const today = new Date();
  const target = new Date(`${date}T00:00:00.000Z`);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function priorityByDays(days: number): OperationalPriority {
  if (days <= 0) return "urgent";
  if (days <= 2) return "high";
  if (days <= 7) return "normal";
  return "low";
}

export function buildOperationalActions(state: WorkspaceState): OperationalAction[] {
  const actions: OperationalAction[] = [];

  state.clients
    .filter((client) => client.status === "lead")
    .forEach((client) => {
      actions.push({
        id: `lead-${client.id}`,
        type: "lead",
        priority: client.leadTemp === "quente" ? "urgent" : client.leadTemp === "morno" ? "high" : "normal",
        title: `Responder ${client.name}`,
        description: client.nextAction || "Defina o próximo passo comercial e transforme a conversa em proposta.",
        href: "/clientes",
        cta: "Abrir comercial",
      });
    });

  state.proposals
    .filter((proposal) => proposal.status === "draft" || proposal.status === "sent")
    .forEach((proposal) => {
      const days = daysUntil(proposal.expectedCloseDate);
      actions.push({
        id: `proposal-${proposal.id}`,
        type: "proposal",
        priority: priorityByDays(days),
        title: `Fechar proposta: ${proposal.title}`,
        description: `${getClientName(state, proposal.clientId)} · ${formatCurrency(proposal.amount, state.privacyMode)} · fechamento ${formatDate(proposal.expectedCloseDate)}.`,
        href: "/clientes",
        cta: "Ver proposta",
        dueAt: proposal.expectedCloseDate,
      });
    });

  state.projects
    .filter((project) => project.status !== "entregue")
    .forEach((project) => {
      const nextStep = PRODUCTION_PIPELINE.find((step) => !project.pipeline[step.key]);
      const days = daysUntil(project.deliveryDate || project.deadline);
      if (nextStep) {
        actions.push({
          id: `project-step-${project.id}`,
          type: "project",
          priority: project.priority === "urgente" ? "urgent" : priorityByDays(days),
          title: `${nextStep.label}: ${project.title}`,
          description: `${getClientName(state, project.clientId)} precisa avançar no pipeline antes da entrega em ${formatDate(project.deliveryDate || project.deadline)}.`,
          href: "/projetos",
          cta: "Avançar projeto",
          dueAt: project.deliveryDate || project.deadline,
        });
      }

      const hasBriefingDoc = state.documents.some((doc) => doc.projectId === project.id && doc.docType === "briefing");
      if (!hasBriefingDoc) {
        actions.push({
          id: `document-briefing-${project.id}`,
          type: "document",
          priority: "normal",
          title: `Gerar briefing: ${project.title}`,
          description: "Crie o documento base para alinhar cliente, equipe e produção.",
          href: "/studio",
          cta: "Gerar documento",
        });
      }

      if (project.status === "review" || Object.values(project.pipeline).filter(Boolean).length >= 4) {
        actions.push({
          id: `review-${project.id}`,
          type: "review",
          priority: "high",
          title: `Abrir review: ${project.title}`,
          description: "Suba o corte, gere link público e concentre comentários por timestamp.",
          href: "/review",
          cta: "Criar review",
        });
      }
    });

  state.financeEntries
    .filter((entry) => entry.status !== "paid")
    .forEach((entry) => {
      const days = daysUntil(entry.dueAt);
      actions.push({
        id: `finance-${entry.id}`,
        type: "finance",
        priority: entry.status === "late" ? "urgent" : priorityByDays(days),
        title: entry.type === "payable" ? `Pagar ${entry.label}` : `Cobrar ${entry.label}`,
        description: `${formatCurrency(entry.amount, state.privacyMode)} · vencimento ${formatDate(entry.dueAt)}.`,
        href: "/financeiro",
        cta: entry.type === "payable" ? "Ver saída" : "Ver cobrança",
        dueAt: entry.dueAt,
      });
    });

  return actions.sort((a, b) => {
    const score: Record<OperationalPriority, number> = { urgent: 4, high: 3, normal: 2, low: 1 };
    if (score[b.priority] !== score[a.priority]) return score[b.priority] - score[a.priority];
    return daysUntil(a.dueAt) - daysUntil(b.dueAt);
  });
}

export function buildUnifiedTimeline(state: WorkspaceState): OperationalEvent[] {
  const events: OperationalEvent[] = [];

  state.clients.forEach((client) => {
    events.push({
      id: `client-${client.id}`,
      type: "lead",
      title: client.status === "lead" ? `Lead criado: ${client.name}` : `Cliente ativo: ${client.name}`,
      description: client.nextAction,
      href: "/clientes",
      date: client.createdAt,
      status: client.status,
    });
  });

  state.proposals.forEach((proposal) => {
    events.push({
      id: `proposal-${proposal.id}`,
      type: "proposal",
      title: `Proposta ${proposal.status}: ${proposal.title}`,
      description: `${getClientName(state, proposal.clientId)} · ${formatCurrency(proposal.amount, state.privacyMode)}`,
      href: "/clientes",
      date: proposal.updatedAt || proposal.createdAt,
      status: proposal.status,
    });
  });

  state.projects.forEach((project) => {
    events.push({
      id: `project-${project.id}`,
      type: "project",
      title: `Projeto: ${project.title}`,
      description: `${getClientName(state, project.clientId)} · entrega ${formatDate(project.deliveryDate || project.deadline)}`,
      href: "/projetos",
      date: project.createdAt,
      status: project.status,
    });
    events.push({
      id: `delivery-${project.id}`,
      type: "delivery",
      title: `Entrega prevista: ${project.title}`,
      description: getClientName(state, project.clientId),
      href: "/projetos",
      date: project.deliveryDate || project.deadline,
      status: project.status,
    });
  });

  state.documents.forEach((document) => {
    events.push({
      id: `document-${document.id}`,
      type: "document",
      title: `Documento gerado: ${document.title}`,
      description: document.summary.split("\n")[0] || "Histórico salvo",
      href: `/studio/documentos/${document.id}`,
      date: document.createdAt,
      status: document.docType,
    });
  });

  state.financeEntries.forEach((entry) => {
    events.push({
      id: `finance-${entry.id}`,
      type: "finance",
      title: entry.type === "payable" ? `Saída: ${entry.label}` : `Entrada: ${entry.label}`,
      description: `${formatCurrency(entry.amount, state.privacyMode)} · ${entry.status}`,
      href: "/financeiro",
      date: entry.dueAt,
      status: entry.status,
    });
  });

  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function buildOperationalCockpit(state: WorkspaceState) {
  const actions = buildOperationalActions(state);
  const timeline = buildUnifiedTimeline(state);
  const activeProjects = state.projects.filter((project) => project.status !== "entregue");
  const approvedProjects = state.projects.filter((project) => Object.values(project.pipeline).every(Boolean));

  return {
    nextAction: actions[0] ?? null,
    actions,
    timeline,
    kpis: {
      leads: state.clients.filter((client) => client.status === "lead").length,
      proposals: state.proposals.filter((proposal) => proposal.status === "draft" || proposal.status === "sent").length,
      activeProjects: activeProjects.length,
      pendingDocuments: activeProjects.filter((project) => !state.documents.some((doc) => doc.projectId === project.id)).length,
      reviewsToOpen: activeProjects.filter((project) => project.status === "review" || Object.values(project.pipeline).filter(Boolean).length >= 4).length,
      deliveriesReady: approvedProjects.length,
      financeOpen: state.financeEntries.filter((entry) => entry.status !== "paid").length,
    },
  };
}
