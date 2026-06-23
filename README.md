# NEXO Studio OS

Sistema operacional para produtoras audiovisuais, filmmakers, fotógrafos, editores e equipes criativas centralizarem clientes, projetos, documentos, aprovações, financeiro, arquivos e operação.

O objetivo do NEXO é reduzir improviso operacional sem transformar uma produtora em um painel administrativo genérico.

---

## 🟢 Acesso ao Repositório

> **Status:** Repositório acessível e verificado em 23 de junho de 2026.
> 
> Este projeto está sendo desenvolvido ativamente com acesso aos arquivos fonte confirmado. A base de código inclui todas as rotas, features, componentes, services, hooks, types e migrations do banco de dados.

---

## Produto

O NEXO organiza a rotina criativa em módulos conectados:

- **Dashboard operacional** com prioridades do dia.
- **CRM** para clientes, leads, recorrentes, parcerias e freelancers.
- **Projetos audiovisuais** com briefing, pipeline, checklist, equipe, prazos e referências.
- **Studio Docs** para briefing, proposta, contrato, recibo, callsheet e checklist.
- **Review de vídeo** com link público, comentários por timestamp e status de aprovação.
- **Financeiro simples** para recebíveis, pagos, custos e previsibilidade.
- **Configurações da produtora** para alimentar documentos e PDFs.
- **Admin** com permissões de workspace.
- **Portal do Cliente** — área logada para clientes acompanharem projetos, documentos e aprovações.

## Stack

- Next.js 15 App Router
- TypeScript 5
- React 19
- Tailwind CSS 3
- Supabase Auth, Postgres, Storage e RLS
- hls.js para suporte a player HLS
- React Hook Form + Zod
- Lucide React

## Estrutura

```
src/app              Rotas do App Router
  ├── admin/         Painel administrativo
  ├── auth/          Autenticação
  ├── cliente/       Portal do cliente (logado)
  ├── clientes/      CRM de clientes
  ├── configuracoes/ Configurações da produtora
  ├── dashboard/     Dashboard operacional
  ├── financeiro/    Módulo financeiro
  ├── projetos/      Gestão de projetos
  ├── review/        Review público de vídeo
  └── studio/        Studio Docs

src/components       Shell, UI e componentes compartilhados
  ├── app/           Componentes de app shell
  ├── auth/          Componentes de autenticação
  └── ui/            Componentes de UI base

src/features         Módulos do produto
  ├── admin/         Features administrativas
  ├── client-portal/ Portal do cliente
  ├── clients/       Gestão de clientes
  ├── dashboard/     Dashboard operacional
  ├── finance/       Módulo financeiro
  ├── marketing/     Landing page e marketing
  ├── projects/      Gestão de projetos
  ├── settings/      Configurações
  ├── studio-docs/   Documentos da produtora
  └── video-review/  Review de vídeo

src/hooks            Estado e integrações de workspace
src/lib              Constantes, utilitários e clientes SDK
src/services         Camada de acesso a dados
src/types            Tipos de domínio

supabase/migrations  Migrations versionadas do banco
  ├── 20260602_initial_next_foundation.sql
  ├── 20260603_real_roles_rls.sql
  ├── 20260604_review_storage_upload.sql
  ├── 20260605_review_public_rpc_security.sql
  ├── 20260606_workspace_member_status.sql
  ├── 20260607_operational_backend_foundation.sql
  ├── 20260608_client_project_completeness.sql
  ├── 20260609_commercial_proposals.sql
  └── 20260610_backend_security_hardening.sql

docs                 Runbooks, auditorias e princípios de produto
  ├── critical-product-audit.md
  ├── deploy-runbook.md
  ├── design-system.md
  ├── product-design-ux-ui-audit-20260602.md
  ├── product-principles.md
  └── ux-regression-audit.md
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

---

## Deploys

- **Produção:** [nexo-next-cu5g9yl7e-elytraprod-hues-projects.vercel.app](https://nexo-next-cu5g9yl7e-elytraprod-hues-projects.vercel.app)
- **Domínio:** [nexo-next-blue.vercel.app](https://nexo-next-blue.vercel.app)
