export const AUDIOVISUAL_PRESETS = [
  {
    id: "reel",
    label: "Reel premium",
    title: "Reel premium",
    type: "vertical",
    service: "Reel / Short",
    value: 800,
    checklist: ["Gancho", "Roteiro curto", "Captação vertical", "Edição dinâmica", "Legenda", "Aprovação", "Publicação"],
  },
  {
    id: "institucional",
    label: "Institucional",
    title: "Vídeo institucional",
    type: "gravação",
    service: "Vídeo Institucional",
    value: 3500,
    checklist: ["Briefing", "Roteiro", "Decupagem", "Captação", "Edição", "Motion", "Revisão", "Entrega"],
  },
  {
    id: "evento",
    label: "Evento",
    title: "Cobertura de evento",
    type: "evento",
    service: "Cobertura de Evento",
    value: 2500,
    checklist: ["Briefing", "Cronograma", "Lista de takes", "Captação", "Seleção", "Edição", "Entrega"],
  },
  {
    id: "edicao",
    label: "Edição",
    title: "Edição de vídeo",
    type: "edição",
    service: "Edição de Vídeo",
    value: 600,
    checklist: ["Receber arquivos", "Organizar mídia", "Corte bruto", "Trilha e efeitos", "Color", "Revisão", "Exportação"],
  },
  {
    id: "drone",
    label: "Drone",
    title: "Filmagem com drone",
    type: "drone",
    service: "Filmagem com Drone",
    value: 1500,
    checklist: ["Autorização do local", "Plano de voo", "Captação aérea", "Backup", "Seleção", "Entrega"],
  },
  {
    id: "doc",
    label: "Mini doc",
    title: "Mini documentário",
    type: "documentário",
    service: "Mini Documentário",
    value: 5000,
    checklist: ["Pesquisa", "Entrevistas", "Roteiro documental", "Captação", "Montagem", "Color e som", "Revisão", "Entrega"],
  },
] as const;

export const STUDIO_DOCUMENTS = [
  { id: "briefing", label: "Briefing", color: "#3b82f6", description: "Objetivo, público, narrativa, formato, referências e aprovação." },
  { id: "roteiro", label: "Roteiro", color: "#fb923c", description: "Estrutura narrativa, cenas, mensagem-chave, falas, CTA e ritmo." },
  { id: "callsheet", label: "Callsheet", color: "#f97316", description: "Ordem do dia, equipe, locação, horários, contatos e segurança." },
  { id: "decupagem", label: "Decupagem", color: "#8b5cf6", description: "Planos, câmera, lentes, áudio, movimento e cobertura." },
  { id: "orcamento", label: "Orçamento", color: "#10b981", description: "Categorias de produção, equipe, equipamento, pós e condições." },
  { id: "cronograma", label: "Cronograma", color: "#eab308", description: "Pré, captação, pós, revisão, aprovações e entrega final." },
  { id: "checklist", label: "Checklist de set", color: "#06b6d4", description: "Câmera, luz, áudio, produção, dados e fechamento de set." },
  { id: "entrega", label: "Relatório de entrega", color: "#ef4444", description: "Arquivos finais, formatos, versões, pendências e aceite." },
] as const;

export const PRODUCTION_PIPELINE = [
  { key: "briefing", label: "Briefing", docType: "briefing", color: "#3b82f6" },
  { key: "roteiro", label: "Roteiro", docType: "roteiro", color: "#fb923c" },
  { key: "decupagem", label: "Decupagem", docType: "decupagem", color: "#8b5cf6" },
  { key: "callsheet", label: "Callsheet", docType: "callsheet", color: "#f97316" },
  { key: "checklist", label: "Checklist", docType: "checklist", color: "#06b6d4" },
  { key: "entrega", label: "Entrega", docType: "entrega", color: "#10b981" },
] as const;

export const RELATIONSHIP_TYPES = [
  { id: "cliente", label: "Cliente", description: "Venda pontual ou lead" },
  { id: "recorrente", label: "Recorrente mensal", description: "Contrato, mensalidade e entregas recorrentes" },
  { id: "parceria", label: "Parceria / permuta", description: "Troca, collab, indicação ou contrapartida" },
  { id: "freelancer", label: "Freelancer", description: "Equipe externa, função, diária e disponibilidade" },
] as const;
