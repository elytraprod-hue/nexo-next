import type { StudioDocId } from "@/lib/constants";
import type { WorkspaceState } from "@/lib/workspace-state";

export type GuidedWorkflowStep = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  done: boolean;
  blocked?: boolean;
  need: string;
};

export type DocumentNeed = {
  id: string;
  title: string;
  description: string;
  docTypes: StudioDocId[];
  color: string;
};

export const DOCUMENT_NEEDS: DocumentNeed[] = [
  {
    id: "vender",
    title: "Quero vender um projeto",
    description: "Proposta, orçamento e contrato com dados da produtora.",
    docTypes: ["proposta", "orcamento", "contrato"],
    color: "var(--green)",
  },
  {
    id: "preparar",
    title: "Vou preparar uma gravação",
    description: "Briefing, roteiro, decupagem, callsheet e checklist.",
    docTypes: ["briefing", "roteiro", "decupagem", "callsheet", "checklist"],
    color: "var(--violet)",
  },
  {
    id: "autorizar",
    title: "Preciso proteger o set",
    description: "Autorização de imagem, responsabilidades e pontos de risco.",
    docTypes: ["autorizacao", "contrato", "checklist"],
    color: "#ec4899",
  },
  {
    id: "entregar",
    title: "Vou entregar e receber",
    description: "Relatório de entrega, aceite e base financeira.",
    docTypes: ["entrega", "cronograma", "orcamento"],
    color: "var(--orange)",
  },
];

export function buildGuidedWorkflow(state: WorkspaceState) {
  const hasClient = state.clients.length > 0;
  const hasProposal = state.proposals.length > 0;
  const hasApprovedProposal = state.proposals.some((proposal) => proposal.status === "approved");
  const hasProject = state.projects.length > 0;
  const hasProductionDoc = state.documents.some((doc) => ["briefing", "contrato", "callsheet", "checklist"].includes(doc.docType));
  const hasReviewCandidate = state.projects.some((project) => project.status === "review" || Object.values(project.pipeline).filter(Boolean).length >= 4);
  const hasDelivery = state.projects.some((project) => project.status === "entregue" || project.deliverables.some((item) => item.done));
  const hasFinance = state.financeEntries.length > 0;

  const steps: GuidedWorkflowStep[] = [
    {
      id: "client",
      label: "01",
      title: "Cadastrar contato",
      description: "Registre cliente, origem, necessidade e próximo passo sem preencher tudo de uma vez.",
      href: "/clientes",
      cta: hasClient ? "Ver clientes" : "Criar cliente",
      done: hasClient,
      need: "Sem cliente não existe proposta, projeto nem histórico confiável.",
    },
    {
      id: "proposal",
      label: "02",
      title: "Transformar em proposta",
      description: "Crie uma oferta com escopo, valor, validade e chance de fechamento.",
      href: "/clientes",
      cta: hasProposal ? "Ver propostas" : "Criar proposta",
      done: hasProposal,
      blocked: !hasClient,
      need: "A operação precisa saber o que está sendo vendido e por quanto.",
    },
    {
      id: "project",
      label: "03",
      title: "Abrir projeto",
      description: "Converta a venda em produção com preset, prazo, equipe, checklist e pipeline.",
      href: "/projetos",
      cta: hasProject ? "Ver projetos" : "Criar projeto",
      done: hasProject,
      blocked: !hasClient,
      need: hasApprovedProposal ? "Proposta aprovada deve virar execução." : "Mesmo antes do aceite, um projeto interno pode organizar a produção.",
    },
    {
      id: "documents",
      label: "04",
      title: "Gerar documentos",
      description: "Use briefing, contrato, callsheet e checklist com branding automático da produtora.",
      href: "/studio",
      cta: hasProductionDoc ? "Ver documentos" : "Gerar documento",
      done: hasProductionDoc,
      blocked: !hasProject,
      need: "Documento bom reduz reunião, retrabalho e erro de set.",
    },
    {
      id: "review",
      label: "05",
      title: "Subir review",
      description: "Abra aprovação de vídeo com upload, link público, comentários e status.",
      href: "/review",
      cta: hasReviewCandidate ? "Abrir review" : "Preparar review",
      done: hasReviewCandidate,
      blocked: !hasProject,
      need: "A aprovação precisa sair do WhatsApp e virar histórico por timestamp.",
    },
    {
      id: "delivery",
      label: "06",
      title: "Entregar com aceite",
      description: "Consolide arquivos finais, versões, pendências e aceite do cliente.",
      href: "/projetos",
      cta: hasDelivery ? "Ver entregas" : "Preparar entrega",
      done: hasDelivery,
      blocked: !hasProject,
      need: "Entrega sem aceite vira dúvida, retrabalho e cobrança difícil.",
    },
    {
      id: "finance",
      label: "07",
      title: "Cobrar e prever caixa",
      description: "Conecte contrato, entrega e recebimento para o dashboard mostrar decisão.",
      href: "/financeiro",
      cta: hasFinance ? "Ver caixa" : "Criar lançamento",
      done: hasFinance,
      blocked: !hasClient,
      need: "Produtora saudável sabe o que entra, o que atrasa e o que pode vender.",
    },
  ];

  const completed = steps.filter((step) => step.done).length;
  const currentStep = steps.find((step) => !step.done && !step.blocked) ?? steps.find((step) => !step.done) ?? steps[steps.length - 1];
  const progress = Math.round((completed / steps.length) * 100);

  return {
    steps,
    currentStep,
    progress,
    completed,
    total: steps.length,
    summary:
      progress >= 100
        ? "Operação completa: agora o foco é repetir o ciclo com qualidade e margem."
        : `${completed} de ${steps.length} etapas estruturadas. O sistema recomenda continuar por: ${currentStep.title}.`,
  };
}
