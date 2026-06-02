# Auditoria de regressao UX/UI - NEXO Next

Data: 2026-06-02

## Diagnostico geral

A migracao para Next.js melhorou estrutura, rotas, tipagem e manutencao, mas simplificou demais a experiencia de produto. O sistema novo ficou mais proximo de um SaaS modular comum; o original tinha mais sensacao de ambiente operacional vivo: boot, sessao restaurada, notificacoes, dock, bloqueio, alertas contextuais, janelas e feedback imediato.

O objetivo nao e copiar tudo do original. O objetivo e preservar o conceito que agregava valor: "Studio OS para audiovisual", com menos cliques, menos digitacao e mais contexto.

## 1. Funcionalidades perdidas

| Item | Original | Next antes | Impacto | Prioridade | Implementacao |
| --- | --- | --- | --- | --- | --- |
| Login GitHub explicito | Botao "Entrar com GitHub" e estado de cloud | Botao generico "Entrar" | Menos confianca e menos clareza de acesso | Alta | Restaurado como "Entrar GitHub" |
| Tela de boot | Loader com marca e restauracao | Sem boot perceptivel | Perde sensacao de sistema operacional | Alta | Boot OS restaurado no AppShell |
| Restauracao da sessao | Saudacao e mensagem de sessao restaurada | Estado silencioso | Produto parecia menos vivo | Alta | Toast de saudacao/restauracao |
| Notificacoes do sistema | Toast premium e banners contextuais | Sem notificacao global | Usuario nao recebe feedback | Alta | Toast + contexto ativo global |
| Dock rapido | Busca, privacidade, bloqueio | Botao flutuante simples | Menos sensacao desktop-like | Alta | Dock restaurado |
| Bloqueio de tela | Lock screen por privacidade | Ausente | Perde seguranca percebida | Media/Alta | Lock manual restaurado |
| Preview PDF real | Iframe com pagina de documento | Texto em `<pre>` e PDF em breve | Degrada valor do Studio Docs | Alta | Preview PDF + exportar PDF |
| Review demo funcional | Modulo com player real quando havia URL | Demo aguardando URL | Modulo principal parecia incompleto | Critica | Demo com video real |

## 2. Microinteracoes perdidas

- Feedback apos acao: original notificava criacao, atualizacao, comentario e exclusao.
- Animacao de entrada: original usava fade/slide/scale para telas e modais.
- Estados de loading: original tinha fallback por area e skeletons.
- Privacidade de valores: original tinha olho/dock persistente; Next tinha botao so no financeiro.
- Mensagem de boas-vindas: original humanizava o inicio da sessao.
- Fechar/dismiss em alertas: original permitia limpar contexto do dia.

Implementado nesta rodada: toast premium, boot, contexto ativo, dock, bloqueio, privacidade persistente no dock.

## 3. Elementos de UX perdidos

- Hierarquia operacional: o dashboard Next abria com hero grande e muitos cards. O original priorizava "o que fazer agora".
- Detalhes progressivos: original tinha "Ver detalhes do dia"; Next mostrava mais informacao simultanea.
- Navegacao por modo: original tinha modo simples/completo. Next tem menos rotas, mas perdeu a ideia de sistema configuravel.
- Documento como produto: original mostrava a pagina final; Next mostrava resumo textual.
- Review como produto premium: demo sem video enfraquecia a confianca.

Implementado nesta rodada: dashboard virou cockpit com decisao principal, KPIs compactos e mapa completo sob demanda.

## 4. Navegacao perdida

- Busca global no original pesquisava entidades existentes e acoes. A nova Command Palette cria bem, mas ainda precisa voltar a buscar registros reais com ranking.
- Sidebar original tinha grupos por area e indicava visao atual. Next tem rotas mais limpas, mas menos contexto.
- Dock original oferecia acoes sem navegar. Next tinha dois botoes flutuantes isolados.

Recomendacao seguinte: evoluir a Command Palette para buscar clientes, projetos, documentos e lancamentos, alem de criar.

## 5. Produtividade perdida

- Atalhos de data: original tinha chips de hoje, amanha, +7 dias.
- Campos inteligentes: original usava chips, option cards, currency input, duration picker e masked input.
- Fluxos guiados: original preenchia documento/projeto a partir do cliente/projeto.
- Confirmacoes destrutivas: original confirmava exclusoes com contexto.

Implementacao parcial ja existe no Next por presets, mas ainda precisa ampliar nos formularios de cliente/projeto e documentos.

## 6. Percepcao de qualidade perdida

- O produto ficou mais "dashboard administrativo" onde deveria parecer "ambiente operacional".
- O primeiro viewport tinha informacao demais e pouco comando claro.
- O Review, que deveria ser o modulo mais premium, abria como placeholder.
- O Studio Docs prometia PDF, mas entregava texto.

Implementado nesta rodada: camada OS, cockpit, PDF preview/export e review demo funcional.

## Auditoria por tela

### Layout global

Problema: pouca sensacao de sistema vivo apos a migracao.
Impacto: reducao de valor percebido.
Solucao: boot, toast, contexto ativo, dock, lock screen.
Prioridade: Alta.
Status: Implementado.

### Sidebar/Header

Problema: em telas medias, a navegacao duplicava peso visual com header grande e nav horizontal.
Impacto: primeiro viewport apertado.
Solucao: proxima etapa deve compactar header em telas tablet e mover navegacao secundaria para dock/bottom quando necessario.
Prioridade: Media.
Status: Pendente.

### Dashboard

Problema: parecia colecao de cards com hero grande.
Impacto: usuario demora mais para entender a acao do dia.
Solucao: cockpit com saudacao, decisao principal, KPIs compactos, score e detalhes sob demanda.
Prioridade: Alta.
Status: Implementado.

### CRM

Problema: cadastro esta simples, mas menos poderoso que o original em chips, origem, proxima acao e atalhos.
Impacto: mais digitacao e menos contexto comercial.
Solucao: restaurar formulario guiado em etapas, chips de origem/proxima acao/follow-up e tipos de relacao.
Prioridade: Alta.
Status: Proxima etapa.

### Projetos

Problema: muitos botoes simultaneos nos cards de projeto.
Impacto: bom para power user, pesado para iniciante.
Solucao: manter pipeline visual, mas mover checklist completo para detalhe/modal e destacar "proxima etapa".
Prioridade: Media/Alta.
Status: Pendente.

### Financeiro

Problema: leitura boa, mas sem criacao rapida de lancamentos.
Impacto: depende de dados seedados.
Solucao: criar lancamento por chips: entrada, entrega, freela, equipamento, recorrente.
Prioridade: Media.
Status: Pendente.

### Documentos

Problema: preview textual e PDF em breve degradavam o valor.
Impacto: documento parecia resumo, nao entregavel profissional.
Solucao: preview PDF real e exportar PDF.
Prioridade: Alta.
Status: Implementado.

### Review de videos

Problema: demo sem video parecia incompleta.
Impacto: modulo principal perdia confianca.
Solucao: demo com video real, comentarios timestamp e aprovacoes visiveis.
Prioridade: Critica.
Status: Implementado.

### Login

Problema: botao generico e Supabase sem env real quebram expectativa.
Impacto: usuario acha que login nao existe ou esta incompleto.
Solucao: copy explicita GitHub e finalizar env/schema Supabase.
Prioridade: Alta.
Status: Copy implementada; Supabase real depende de credenciais/migration aplicada.

## Performance

Observacoes atuais:

- Rotas principais sao separadas pelo App Router, bom para carregamento por pagina.
- Muitas telas sao client components completas; ha oportunidade de deixar paginas shell/server e mover interatividade para componentes menores.
- Bundle inicial atual fica perto de 195 kB nas rotas internas; aceitavel para MVP, mas precisa cair com split de componentes grandes.
- `hls.js` entra dinamicamente no player, correto.
- A Command Palette ainda carrega no AppShell, mas e pequena. Se crescer, deve virar import dinamico.

Prioridades tecnicas:

1. Separar Command Palette e Studio preview em lazy client chunks.
2. Persistir dados reais no Supabase com queries por workspace e cache.
3. Evitar que todas as telas dependam do provider inteiro quando so precisam de metricas.
4. Adicionar loading skeleton por rota.
5. Medir Web Vitals no deploy real.

## Melhorias aplicadas nesta rodada

- Boot/loader inicial do Studio OS.
- Toast de sistema com saudacao e sessao restaurada.
- Dock rapido com comando, privacidade, lock e indicadores.
- Lock screen manual.
- Contexto ativo global.
- Dashboard redesenhado como centro operacional.
- Studio Docs com preview de PDF real e exportacao via print.
- Review demo com video funcional.
- Login GitHub com copy explicita.

## Proximas melhorias de maior impacto

1. CRM guiado premium: chips, atalhos de follow-up e modal de detalhe.
2. Projetos com detalhe/modal para reduzir botoes no card.
3. Command Palette pesquisando registros reais, nao so criando.
4. Financeiro com lancamento por presets de audiovisual.
5. Login/Supabase real finalizado com workspace e RLS aplicado.
