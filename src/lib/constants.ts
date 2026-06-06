export type AudiovisualPreset = {
  id: string;
  label: string;
  title: string;
  type: string;
  service: string;
  value: number;
  checklist: string[];
  deliverables: string[];
  defaultBriefing: {
    objective: string;
    duration: string;
    format: string;
  };
};

export const AUDIOVISUAL_PRESETS = [
  {
    id: "reel",
    label: "Reel premium",
    title: "Reel premium",
    type: "vertical",
    service: "Reel / Short",
    value: 800,
    checklist: ["Gancho", "Roteiro curto", "Captação vertical", "Edição dinâmica", "Legenda", "Aprovação", "Publicação"],
    deliverables: ["1 vídeo vertical 9:16", "Capa/thumbnail", "Legenda revisada", "Arquivo final em MP4"],
    defaultBriefing: {
      objective: "Gerar retenção e resposta rápida em redes sociais.",
      duration: "15-45s",
      format: "9:16",
    },
  },
  {
    id: "institucional",
    label: "Institucional",
    title: "Vídeo institucional",
    type: "gravação",
    service: "Vídeo Institucional",
    value: 3500,
    checklist: ["Briefing", "Roteiro", "Decupagem", "Captação", "Edição", "Motion", "Revisão", "Entrega"],
    deliverables: ["Vídeo principal 16:9", "Versão curta para redes", "Thumbnail", "Arquivo final em alta"],
    defaultBriefing: {
      objective: "Apresentar a marca com clareza, autoridade e confiança.",
      duration: "60-120s",
      format: "16:9 master + cortes sociais",
    },
  },
  {
    id: "evento",
    label: "Evento",
    title: "Cobertura de evento",
    type: "evento",
    service: "Cobertura de Evento",
    value: 2500,
    checklist: ["Briefing", "Cronograma", "Lista de takes", "Captação", "Seleção", "Edição", "Entrega"],
    deliverables: ["Aftermovie", "Cortes curtos para redes", "Seleção de melhores takes", "Arquivo final em alta"],
    defaultBriefing: {
      objective: "Registrar energia do evento e vender a próxima edição.",
      duration: "60-180s",
      format: "16:9 + 9:16",
    },
  },
  {
    id: "edicao",
    label: "Edição",
    title: "Edição de vídeo",
    type: "edição",
    service: "Edição de Vídeo",
    value: 600,
    checklist: ["Receber arquivos", "Organizar mídia", "Corte bruto", "Trilha e efeitos", "Color", "Revisão", "Exportação"],
    deliverables: ["Corte final", "Versão com legenda", "Arquivo editável quando combinado", "Exportação em MP4"],
    defaultBriefing: {
      objective: "Transformar mídia bruta em uma peça clara e publicável.",
      duration: "A definir",
      format: "Conforme canal de entrega",
    },
  },
  {
    id: "drone",
    label: "Drone",
    title: "Filmagem com drone",
    type: "drone",
    service: "Filmagem com Drone",
    value: 1500,
    checklist: ["Autorização do local", "Plano de voo", "Captação aérea", "Backup", "Seleção", "Entrega"],
    deliverables: ["Takes aéreos tratados", "Vídeo final com drone", "Banco de imagens aéreas", "Arquivo final em alta"],
    defaultBriefing: {
      objective: "Aumentar percepção de valor com contexto, escala e movimento.",
      duration: "30-90s",
      format: "4K + versão social",
    },
  },
  {
    id: "doc",
    label: "Mini doc",
    title: "Mini documentário",
    type: "documentário",
    service: "Mini Documentário",
    value: 5000,
    checklist: ["Pesquisa", "Entrevistas", "Roteiro documental", "Captação", "Montagem", "Color e som", "Revisão", "Entrega"],
    deliverables: ["Mini documentário", "Teaser curto", "Cortes de entrevista", "Arquivo master"],
    defaultBriefing: {
      objective: "Contar uma história com narrativa, emoção e prova visual.",
      duration: "5-15 min",
      format: "16:9 master + teaser",
    },
  },
  {
    id: "trafego",
    label: "Criativo ads",
    title: "Criativo para tráfego",
    type: "ads",
    service: "Criativo para Tráfego",
    value: 900,
    checklist: ["Objetivo da campanha", "Gancho", "Roteiro direto", "Captação ou assets", "Edição com CTA", "Variações", "Entrega"],
    deliverables: ["Criativo principal", "2 variações de gancho", "Versão com legenda", "Arquivo pronto para anúncios"],
    defaultBriefing: {
      objective: "Gerar conversão com mensagem direta e prova visual.",
      duration: "15-30s",
      format: "9:16 + 1:1 quando necessário",
    },
  },
  {
    id: "stories",
    label: "Stories",
    title: "Pack de stories",
    type: "vertical",
    service: "Pack de Stories",
    value: 500,
    checklist: ["Pauta", "Roteiro curto", "Assets", "Edição vertical", "Legendas", "Aprovação", "Entrega"],
    deliverables: ["10 stories editados", "Capa visual", "Textos/legendas", "Arquivos verticais"],
    defaultBriefing: {
      objective: "Criar sequência leve, rápida e publicável para rotina social.",
      duration: "5-15s por story",
      format: "9:16",
    },
  },
] satisfies AudiovisualPreset[];

export const NICHE_PLAYBOOKS = [
  {
    id: "clinica",
    niche: "Clínicas e estética",
    promise: "Confiança, autoridade e agenda cheia com prova visual.",
    presetId: "reel",
    value: 2400,
    nextAction: "Enviar roteiro de autoridade e exemplos de prova social",
    nextActions: [
      "Enviar roteiro de autoridade e exemplos de prova social",
      "Montar pack de 3 reels: procedimento, depoimento e bastidor",
      "Agendar visita técnica para mapear ambientes e restrições",
    ],
  },
  {
    id: "imobiliario",
    niche: "Imobiliárias e corretores",
    promise: "Transformar imóveis em percepção de valor e novos interessados.",
    presetId: "drone",
    value: 3500,
    nextAction: "Pedir endereço, diferenciais do imóvel e janela de captação",
    nextActions: [
      "Pedir endereço, diferenciais do imóvel e janela de captação",
      "Criar roteiro de visita guiada com drone e detalhes internos",
      "Separar lista de takes para anúncio e versão social",
    ],
  },
  {
    id: "restaurante",
    niche: "Restaurantes e gastronomia",
    promise: "Aumentar desejo, frequência e ticket com conteúdo sensorial.",
    presetId: "stories",
    value: 1800,
    nextAction: "Marcar visita para captar pratos campeões e bastidores",
    nextActions: [
      "Marcar visita para captar pratos campeões e bastidores",
      "Montar sequência de stories para menu, ambiente e chef",
      "Pedir horários de menor movimento para diária enxuta",
    ],
  },
  {
    id: "evento",
    niche: "Eventos e experiências",
    promise: "Registrar energia do evento e vender a próxima edição.",
    presetId: "evento",
    value: 4500,
    nextAction: "Pedir cronograma, atrações e momentos obrigatórios",
    nextActions: [
      "Pedir cronograma, atrações e momentos obrigatórios",
      "Criar mapa de cobertura com chegada, pico e pós-evento",
      "Definir lista de entrevistas rápidas com organizadores e público",
    ],
  },
] as const;

export const STUDIO_DOCUMENTS = [
  { id: "briefing", label: "Briefing", color: "#3b82f6", description: "Objetivo, público, narrativa, formato, referências e aprovação." },
  { id: "proposta", label: "Proposta", color: "#10b981", description: "Escopo, entregáveis, investimento, condições e próximos passos." },
  { id: "contrato", label: "Contrato", color: "#a855f7", description: "Termos, responsabilidades, direitos, pagamento, prazos e aceite." },
  { id: "roteiro", label: "Roteiro", color: "#fb923c", description: "Estrutura narrativa, cenas, mensagem-chave, falas, CTA e ritmo." },
  { id: "callsheet", label: "Callsheet", color: "#f97316", description: "Ordem do dia, equipe, locação, horários, contatos e segurança." },
  { id: "decupagem", label: "Decupagem", color: "#8b5cf6", description: "Planos, câmera, lentes, áudio, movimento e cobertura." },
  { id: "orcamento", label: "Orçamento", color: "#10b981", description: "Categorias de produção, equipe, equipamento, pós e condições." },
  { id: "cronograma", label: "Cronograma", color: "#eab308", description: "Pré, captação, pós, revisão, aprovações e entrega final." },
  { id: "checklist", label: "Checklist de set", color: "#06b6d4", description: "Câmera, luz, áudio, produção, dados e fechamento de set." },
  { id: "autorizacao", label: "Autorização de imagem", color: "#ec4899", description: "Uso de imagem, período, canais, escopo e consentimento." },
  { id: "entrega", label: "Relatório de entrega", color: "#ef4444", description: "Arquivos finais, formatos, versões, pendências e aceite." },
] as const;

export type StudioDocId = (typeof STUDIO_DOCUMENTS)[number]["id"];

export const PRODUCTION_PIPELINE = [
  { key: "briefing", label: "Briefing", docType: "briefing", color: "#3b82f6" },
  { key: "roteiro", label: "Roteiro", docType: "roteiro", color: "#fb923c" },
  { key: "decupagem", label: "Decupagem", docType: "decupagem", color: "#8b5cf6" },
  { key: "callsheet", label: "Callsheet", docType: "callsheet", color: "#f97316" },
  { key: "checklist", label: "Checklist", docType: "checklist", color: "#06b6d4" },
  { key: "entrega", label: "Entrega", docType: "entrega", color: "#10b981" },
] as const;

export type PipelineKey = (typeof PRODUCTION_PIPELINE)[number]["key"];

export const RELATIONSHIP_TYPES = [
  { id: "cliente", label: "Cliente", color: "#10b981", description: "Venda pontual ou oportunidade" },
  { id: "recorrente", label: "Recorrente mensal", color: "#3b82f6", description: "Contrato, mensalidade e entregas recorrentes" },
  { id: "parceria", label: "Parceria / permuta", color: "#8b5cf6", description: "Troca, collab, indicação ou contrapartida" },
  { id: "freelancer", label: "Freelancer", color: "#eab308", description: "Equipe externa, função, diária e disponibilidade" },
] as const;

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[number]["id"];

export const DOC_FIELD_CONFIG: Record<
  StudioDocId,
  {
    title: string;
    tone: string;
    fields: { key: string; label: string; placeholder: string; type?: "text" | "date" | "number" }[];
    areas: { key: string; label: string; placeholder: string }[];
  }
> = {
  briefing: {
    title: "Inteligência do briefing",
    tone: "Documento consultivo com objetivo, público, linguagem e critérios de aprovação.",
    fields: [
      { key: "objective", label: "Objetivo estratégico", placeholder: "O que o filme precisa mudar no público ou negócio?" },
      { key: "audience", label: "Público e contexto", placeholder: "Quem assiste e em que momento?" },
      { key: "brandMessage", label: "Mensagem central", placeholder: "Uma frase que não pode se perder" },
      { key: "approvalCriteria", label: "Critério de aprovação", placeholder: "Como saberemos que ficou certo?" },
    ],
    areas: [
      { key: "mandatoryPoints", label: "Pontos obrigatórios", placeholder: "Promessas, provas, falas, produtos ou cenas indispensáveis" },
      { key: "risks", label: "Restrições e riscos", placeholder: "Compliance, linguagem, locação, autorização ou prazo" },
    ],
  },
  proposta: {
    title: "Proposta audiovisual",
    tone: "Documento comercial pronto para cliente, com escopo, entregáveis, investimento, prazos, condições e aceite.",
    fields: [
      { key: "investment", label: "Investimento", placeholder: "Valor total", type: "number" },
      { key: "paymentTerms", label: "Condições", placeholder: "50% entrada, 50% na entrega" },
      { key: "validUntil", label: "Validade", placeholder: "Data", type: "date" },
      { key: "nextStep", label: "Próximo passo", placeholder: "Aprovar proposta e iniciar briefing" },
      { key: "deliveryDeadline", label: "Prazo de produção", placeholder: "Ex: 15 dias úteis após briefing aprovado" },
      { key: "reviewRounds", label: "Rodadas inclusas", placeholder: "Ex: 2 rodadas de ajustes" },
    ],
    areas: [
      { key: "scope", label: "Escopo incluído", placeholder: "O que será produzido, para qual objetivo e em quais formatos" },
      { key: "deliverables", label: "Entregáveis", placeholder: "Vídeo principal, cortes, versões, formatos, arquivos finais" },
      { key: "productionFlow", label: "Fluxo de produção", placeholder: "Briefing, pré-produção, captação, edição, revisão e entrega" },
      { key: "extras", label: "Extras e premissas", placeholder: "Deslocamento, urgência, alteração de escopo, direitos e itens fora do pacote" },
    ],
  },
  contrato: {
    title: "Contrato simples de produção",
    tone: "Contrato claro para reduzir dúvida entre produtor, cliente, prazo, revisão e pagamento.",
    fields: [
      { key: "contractValue", label: "Valor contratado", placeholder: "Valor total", type: "number" },
      { key: "startDate", label: "Início", placeholder: "Data", type: "date" },
      { key: "deadline", label: "Entrega", placeholder: "Data", type: "date" },
      { key: "reviewRounds", label: "Rodadas de revisão", placeholder: "Ex: 2 rodadas inclusas" },
    ],
    areas: [
      { key: "responsibilities", label: "Responsabilidades", placeholder: "O que cliente e produtora precisam entregar" },
      { key: "usageRights", label: "Direitos de uso", placeholder: "Canais, período, território e restrições" },
    ],
  },
  roteiro: {
    title: "Estrutura narrativa",
    tone: "Formato de roteiro com beats, falas, cenas e direção de ritmo.",
    fields: [
      { key: "logline", label: "Logline", placeholder: "Resumo do vídeo em uma frase" },
      { key: "hook", label: "Gancho inicial", placeholder: "Primeiros 3 a 8 segundos" },
      { key: "duration", label: "Duração alvo", placeholder: "30s, 60s, 3min..." },
      { key: "cta", label: "CTA / fechamento", placeholder: "Ação ou sensação final" },
    ],
    areas: [
      { key: "scenes", label: "Cenas / beats", placeholder: "Um beat por linha: abertura, prova, virada, fechamento" },
      { key: "voiceover", label: "Texto / locução / falas", placeholder: "Falas, narração ou textos de tela" },
    ],
  },
  callsheet: {
    title: "Ordem do dia de set",
    tone: "Documento operacional para equipe, talento, horários, segurança e logística.",
    fields: [
      { key: "shootDate", label: "Data de captação", placeholder: "Data", type: "date" },
      { key: "callTime", label: "Call time", placeholder: "07:30 equipe / 09:00 talento" },
      { key: "wrapTime", label: "Wrap previsto", placeholder: "18:00" },
      { key: "location", label: "Locação", placeholder: "Endereço e ponto de encontro" },
    ],
    areas: [
      { key: "scheduleRows", label: "Agenda do dia", placeholder: "07:30 montagem de luz\n08:30 teste de áudio\n09:00 cena 1" },
      { key: "crew", label: "Equipe", placeholder: "Direção, câmera, áudio, produção, assistentes" },
    ],
  },
  decupagem: {
    title: "Plano técnico e cobertura",
    tone: "Decupagem com intenção de câmera, lentes, movimento, áudio e cobertura por cena.",
    fields: [
      { key: "sceneCount", label: "Quantidade de cenas", placeholder: "Ex: 6 cenas + B-roll" },
      { key: "format", label: "Entrega", placeholder: "16:9 master + cortes 9:16" },
      { key: "lenses", label: "Lentes / captação", placeholder: "24mm, 35mm, 85mm, drone..." },
      { key: "audioPlan", label: "Plano de áudio", placeholder: "Lapel + boom + ambiente" },
    ],
    areas: [
      { key: "shotList", label: "Lista de planos", placeholder: "Cena 1 | Plano aberto | Contexto | 24mm | Sem fala" },
      { key: "coverageNotes", label: "Cobertura e inserts", placeholder: "Detalhes, mãos, produto, bastidor, reações" },
    ],
  },
  orcamento: {
    title: "Composição comercial",
    tone: "Documento financeiro com categorias, escopo, premissas e condições.",
    fields: [
      { key: "budget", label: "Total proposto", placeholder: "Valor total", type: "number" },
      { key: "crewCost", label: "Equipe", placeholder: "Custo de equipe", type: "number" },
      { key: "equipmentCost", label: "Equipamento", placeholder: "Custo de equipamento", type: "number" },
      { key: "postCost", label: "Pós-produção", placeholder: "Custo de pós", type: "number" },
    ],
    areas: [
      { key: "scope", label: "Escopo incluído", placeholder: "Entregáveis, diárias, versões e revisão" },
      { key: "assumptions", label: "Premissas e extras", placeholder: "Deslocamento, direitos, urgência, alteração de escopo" },
    ],
  },
  cronograma: {
    title: "Mapa de produção",
    tone: "Linha do tempo com fases, marcos, aprovações e margem de produção.",
    fields: [
      { key: "startDate", label: "Início", placeholder: "Data", type: "date" },
      { key: "shootDate", label: "Captação", placeholder: "Data", type: "date" },
      { key: "firstCutDate", label: "Primeiro corte", placeholder: "Data", type: "date" },
      { key: "deadline", label: "Entrega final", placeholder: "Data", type: "date" },
    ],
    areas: [
      { key: "milestones", label: "Marcos", placeholder: "Briefing aprovado\nRoteiro aprovado\nCaptação\nPrimeiro corte\nFinalização" },
      { key: "dependencies", label: "Dependências", placeholder: "Materiais do cliente, aprovações, agenda de entrevistados" },
    ],
  },
  checklist: {
    title: "Checklist premium de set",
    tone: "Checklist técnico por departamento para reduzir erro antes, durante e depois da diária.",
    fields: [
      { key: "productionType", label: "Tipo de produção", placeholder: "Evento, institucional, doc, campanha..." },
      { key: "cameraPackage", label: "Pacote de câmera", placeholder: "Câmera, lentes, mídia, suporte" },
      { key: "audioPackage", label: "Pacote de áudio", placeholder: "Lapelas, boom, gravador, fones" },
      { key: "dataWorkflow", label: "Workflow de dados", placeholder: "Cartões, SSD, backup 3-2-1" },
    ],
    areas: [
      { key: "preflight", label: "Pré-set", placeholder: "Autorizações, agenda, roteiro, baterias, cartões" },
      { key: "wrapChecklist", label: "Fechamento", placeholder: "Backup, conferência, pendências e resumo para cliente" },
    ],
  },
  autorizacao: {
    title: "Autorização de uso de imagem",
    tone: "Documento simples para consentimento de uso de imagem e voz.",
    fields: [
      { key: "personName", label: "Nome autorizado", placeholder: "Nome completo" },
      { key: "document", label: "Documento", placeholder: "CPF/RG quando necessário" },
      { key: "usagePeriod", label: "Período de uso", placeholder: "Ex: indeterminado ou 24 meses" },
      { key: "channels", label: "Canais", placeholder: "Site, redes sociais, anúncios, institucional" },
    ],
    areas: [
      { key: "usageScope", label: "Escopo de uso", placeholder: "Onde a imagem poderá ser usada" },
      { key: "limitations", label: "Limitações", placeholder: "Restrições, exceções ou observações" },
    ],
  },
  entrega: {
    title: "Relatório de entrega e aceite",
    tone: "Documento final com links, versões, specs, pendências e critérios de aceite.",
    fields: [
      { key: "deliveryLinks", label: "Links de entrega", placeholder: "Drive, Frame.io, Vimeo, pasta final" },
      { key: "formats", label: "Formatos", placeholder: "MP4 H.264, 4K, 1080p, 9:16, legendado" },
      { key: "versions", label: "Versões", placeholder: "Master, teaser, cortes sociais, thumbnails" },
      { key: "deadline", label: "Data da entrega", placeholder: "Data", type: "date" },
    ],
    areas: [
      { key: "deliveryNotes", label: "Observações", placeholder: "Pendências, orientações de publicação, próximos passos" },
      { key: "scope", label: "Itens entregues", placeholder: "Um item por linha" },
    ],
  },
};

export function presetById(id?: string) {
  return AUDIOVISUAL_PRESETS.find((preset) => preset.id === id) ?? AUDIOVISUAL_PRESETS[1];
}

export function studioDocById(id?: string) {
  return STUDIO_DOCUMENTS.find((doc) => doc.id === id) ?? STUDIO_DOCUMENTS[0];
}
