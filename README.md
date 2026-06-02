# NEXO Central Next

Nova base do NEXO Central em Next.js + TypeScript, criada em repositório separado para não sobrescrever o projeto atual.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v3
- Supabase SDK
- hls.js para player HLS/adaptive bitrate
- zod + react-hook-form preparados para formulários guiados

## Estrutura

- `src/app`: rotas do App Router
- `src/components`: componentes compartilhados de UI
- `src/features`: módulos do produto
- `src/lib`: constantes, Supabase e utilitários
- `src/services`: acesso a dados
- `src/types`: tipos de domínio
- `supabase/migrations`: migrations do banco
- `docs/product-principles.md`: princípios de decisão do produto

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

Configure as variáveis abaixo na Vercel e no `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# ou, nos projetos novos do Supabase:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Depois aplique a migration:

```bash
supabase db push
```

## Review de vídeo

A área interna fica em:

```bash
/review
```

Ela permite criar review por URL/CDN, Google Drive ou upload real para Supabase Storage no bucket `review-videos`.

A rota pública fica em:

```bash
/review/[token]
```

Também há compatibilidade inicial com links antigos do tipo:

```bash
/?review=TOKEN
```

Esse link redireciona para `/review/TOKEN`.

Para upload real, aplique também a migration `20260602_review_storage_upload.sql`, que cria o bucket `review-videos` e limita upload/edição aos membros do workspace.

## Deploy

```bash
npm run lint
npm run typecheck
npm run build
npx vercel --prod
```

Antes de produção real, valide:

- variáveis de ambiente do Supabase
- policies de RLS
- criação do primeiro workspace
- upload no Supabase Storage
- transcodificação HLS via Mux, Bunny Stream, Cloudflare Stream ou outro CDN para vídeos pesados
