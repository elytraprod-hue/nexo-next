# Auditoria Critica De Produto - NEXO Studio OS

Data: 2026-06-02

## Diagnostico

A migracao para Next.js melhorou a estrutura tecnica, tipagem, rotas e base de Supabase. Mesmo assim, a experiencia atual ainda nao supera o sistema antigo em identidade, fluidez e clareza de produto. A nova versao esta mais organizada, mas partes dela parecem um SaaS administrativo comum, enquanto a visao correta e um sistema operacional para rotina audiovisual.

## 1. Problemas Criticos Encontrados

- A landing atual comunica a categoria, mas ainda nao vende com forca suficiente a diferenca contra Notion, planilha, Drive e Frame.io.
- O CRM ficou mais completo, mas alguns nomes de campo ficaram genericos, como cargo/funcao e responsavel, sem explicar o uso operacional.
- A experiencia visual perdeu parte da identidade do antigo: Syne/DM Sans, atmosfera densa, sidebar fixa, janelas, microinteracoes e presenca de OS.
- O Review tem player, comentario por timestamp e status, mas ainda nao possui fluxo real de criacao, upload, versoes e link publico gerado pela operacao interna.
- Studio Docs tem tipos e preview, mas ainda nao tem profundidade profissional suficiente por documento.
- Configuracao da empresa existe, mas ainda precisa alimentar mais superficies: app shell, portal, links publicos, propostas, contratos e recibos.
- Algumas superficies estao bonitas, mas ainda nao reduzem trabalho real de produtoras: precisam virar fluxos completos, nao apenas telas.

## 2. O Que Precisa Ser Refeito

- CRM deve ser refeito em linguagem de venda audiovisual: decisor, canal de entrada, demanda, verba aproximada, etapa comercial, atendimento e historico.
- Landing deve ser reescrita em torno de dores reais: briefing perdido, cliente no WhatsApp, revisao espalhada, proposta sem historico, entrega sem aceite.
- Review deve ser tratado como produto principal e reconstruido como fluxo: criar review, anexar video, gerar link, comentar, aprovar, versionar.
- Studio Docs deve sair de formulario geral para documento guiado por finalidade.
- Shell deve recuperar a sensacao de desktop/OS com mais personalidade, sem virar decoracao.

## 3. O Que Restaurar Do Sistema Antigo

- Tipografia: DM Sans para texto e Syne para titulos/metricas.
- Atmosfera escura com vidro, bordas finas, acento laranja e detalhes vivos.
- Microinteracoes: hover, cards vivos, toast, boot e contexto ativo.
- Sidebar com mais cara de ambiente operacional.
- Planos e narrativa de produto mais ricos.
- Preview documental integrado e visualmente premium.
- Command Palette como ferramenta real, nao apenas botao.

## 4. O Que Precisa Ser Redesenhado

- Landing page.
- AppShell e navegacao.
- CRM/comercial.
- Studio Docs.
- Review/upload.
- Portal do cliente.
- Estados vazios, loading, erros e confirmacoes destrutivas.

## 5. O Que Precisa Ser Implementado Do Zero

- Criacao interna de review.
- Upload direto e drag and drop.
- Entrada por URL publica e Google Drive.
- Versoes V1, V2, V3 com historico.
- Threads/respostas de comentarios.
- Portal externo do cliente.
- Links compartilhaveis para documentos e reviews.
- Validacao de formularios com regras reais.

## 6. Ordem Correta De Execucao

1. Corrigir linguagem e campos do CRM.
2. Restaurar tipografia e atmosfera visual do sistema antigo.
3. Fortalecer landing com posicionamento real.
4. Transformar configuracao da empresa em fonte central de identidade.
5. Reestruturar Studio Docs por documento.
6. Criar fluxo real de review/upload/link.
7. Criar portal do cliente.
8. Testar manualmente os fluxos principais antes de deploy.

## 7. Riscos

- Continuar adicionando modulos sem resolver a direcao de produto.
- Parecer completo pela interface, mas incompleto no fluxo real.
- Supabase/RLS divergir da experiencia local.
- Review ser percebido como demo, nao ferramenta profissional.
- Documentos ficarem bonitos, mas rasos para uso comercial/juridico.

## 8. Criterios De Conclusao

Uma funcionalidade so e considerada pronta quando possui:

- interface clara;
- fluxo real de ponta a ponta;
- validacao;
- persistencia;
- estado vazio;
- loading;
- erro tratado;
- responsividade;
- integracao com o restante do sistema;
- teste manual do fluxo principal.

## Primeira Correcao Autorizada

Aplicar imediatamente:

- CRM com nomes de campos operacionais e sem termos genericos.
- Identidade visual baseada no antigo: DM Sans + Syne, atmosfera mais OS e menos template SaaS.
- Shell com linguagem de produtora e acao operacional.
