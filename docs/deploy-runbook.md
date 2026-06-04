# Runbook de deploy - NEXO Next

Este runbook existe para impedir deploy no improviso. Toda subida de produção precisa passar pela mesma sequência.

## 1. Antes de mexer

- Confirme que está na pasta `/Users/danteelytra/Documents/nexo-next`.
- Rode `git status --short --branch`.
- Nunca altere uma migration antiga que já pode ter sido aplicada no Supabase.
- Correções de banco entram sempre como uma nova migration em `supabase/migrations`.
- Cada migration precisa ter versão única. Não crie dois arquivos começando com o mesmo prefixo, como `20260602_...`.
- Nunca commite `.env.local`, `.vercel`, `.next`, `node_modules` ou tokens.

## 2. Verificação local

```bash
npm run verify
```

Esse comando executa:

- lint;
- typecheck;
- smoke test de rotas/migrations críticas;
- build de produção.

## 3. Banco

Confira se o projeto está linkado:

```bash
npx supabase status
```

Se precisar linkar:

```bash
npx supabase link --project-ref diygpiqgcwzhatfxlmkx
```

Depois aplique as migrations:

```bash
npm run db:push
```

## 4. Deploy

```bash
npm run deploy:prod
```

Se preferir separar as etapas:

```bash
npm run verify
npm run db:push
npx vercel --prod
```

## 5. Smoke manual em produção

Validar:

- `/` abre a landing;
- `/dashboard` exige login;
- login GitHub volta por `/auth/callback`;
- `/review` exige login;
- `/review/demo` abre o player público;
- criar review real gera link público;
- comentário no review fica preso no timecode;
- Studio Docs salva documento no histórico;
- documento salvo abre em `/studio/documentos/[documentId]`;
- botão Restaurar volta o documento para o editor;
- Admin lista membros reais de `workspace_members`.

## 6. Ordem segura de release

1. Commit local.
2. Push GitHub.
3. `npm run verify`.
4. `npm run db:push`.
5. `npx vercel --prod`.
6. Smoke manual.

Se qualquer etapa falhar, não force deploy. Corrija localmente, gere nova migration se for banco e rode tudo de novo.
