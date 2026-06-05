# NEXO Studio OS

Sistema operacional para produtoras audiovisuais, filmmakers, fotógrafos, editores e equipes criativas centralizarem clientes, projetos, documentos, aprovações, financeiro, arquivos e operação.

O objetivo do NEXO é reduzir improviso operacional sem transformar uma produtora em um painel administrativo genérico.

## Produto

O NEXO organiza a rotina criativa em módulos conectados:

- Dashboard operacional com prioridades do dia.
- CRM para clientes, leads, recorrentes, parcerias e freelancers.
- Projetos audiovisuais com briefing, pipeline, checklist, equipe, prazos e referências.
- Studio Docs para briefing, proposta, contrato, recibo, callsheet e checklist.
- Review de vídeo com link público, comentários por timestamp e status de aprovação.
- Financeiro simples para recebíveis, pagos, custos e previsibilidade.
- Configurações da produtora para alimentar documentos e PDFs.
- Admin com permissões de workspace.

## Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Supabase Auth, Postgres, Storage e RLS
- hls.js para suporte a player HLS

## Estrutura

```txt
src/app            Rotas do App Router
src/components     Shell, UI e componentes compartilhados
src/features       Módulos do produto
src/hooks          Estado e integrações de workspace
src/lib            Constantes, utilitários e clientes SDK
src/services       Camada de acesso a dados
src/types          Tipos de domínio
supabase/migrations Migrations versionadas do banco
docs               Runbooks, auditorias e princípios de produto
```

## Rodar Localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra:

```bash
http://localhost:3000
```

## Variáveis De Ambiente

Crie `.env.local` localmente e configure as variáveis públicas do Supabase do seu próprio projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Nunca commite `.env`, `.env.local`, `.env.vercel.local`, tokens, project refs privados ou strings de conexão.

## Banco De Dados

As migrations ficam em:

```bash
supabase/migrations
```

Para aplicar no projeto Supabase linkado:

```bash
npm run db:push
```

Regras:

- Não edite migrations antigas já aplicadas.
- Toda mudança de banco deve entrar como nova migration.
- RLS e RPCs públicas devem ser revisadas antes de produção.

## Qualidade

Antes de commit/deploy:

```bash
npm run verify
```

Esse comando roda:

- lint;
- typecheck;
- smoke test;
- build de produção.

## Deploy

Deploy de produção:

```bash
npm run deploy:prod
```

Ou em etapas:

```bash
npm run verify
npm run db:push
npx vercel --prod
```

## Segurança

- Dados internos são protegidos por autenticação e permissões de workspace.
- Links públicos de review usam token e RPCs controladas.
- Tabelas sensíveis usam RLS.
- Arquivos de ambiente e credenciais não devem ser versionados.
- Revise `docs/deploy-runbook.md` antes de releases importantes.

## Status

Este projeto está em evolução ativa. A prioridade atual é transformar a base em um SaaS funcional para operação audiovisual real, com fluxos completos de clientes, projetos, propostas, review, documentos, financeiro e área do cliente.
