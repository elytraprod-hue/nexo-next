import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "src/app/dashboard/page.tsx",
  "src/app/clientes/page.tsx",
  "src/app/projetos/page.tsx",
  "src/app/studio/page.tsx",
  "src/app/studio/documentos/[documentId]/page.tsx",
  "src/app/review/page.tsx",
  "src/app/review/[token]/page.tsx",
  "src/app/auth/callback/page.tsx",
  "src/app/admin/page.tsx",
  "supabase/migrations/20260602_initial_next_foundation.sql",
  "supabase/migrations/20260603_real_roles_rls.sql",
  "supabase/migrations/20260604_review_storage_upload.sql",
  "supabase/migrations/20260605_review_public_rpc_security.sql",
  "supabase/migrations/20260606_workspace_member_status.sql",
  "supabase/migrations/20260607_operational_backend_foundation.sql",
  "supabase/migrations/20260608_client_project_completeness.sql",
  "supabase/migrations/20260609_commercial_proposals.sql",
  "supabase/migrations/20260610_backend_security_hardening.sql",
  "src/services/operations-service.ts",
  "src/types/operations.ts",
];

const requiredContents = [
  ["src/app/review/page.tsx", "ProtectedRoute"],
  ["src/services/review-service.ts", "get_public_review"],
  ["src/services/review-service.ts", "add_public_review_comment"],
  ["src/services/review-service.ts", "set_public_review_status"],
  ["src/features/admin/admin-page.tsx", "workspaceMembers"],
  ["src/lib/auth/roles.ts", "canAccessInternal"],
  ["src/services/operations-service.ts", "logActivity"],
  ["src/hooks/use-workspace-state.tsx", "logWorkspaceActivity"],
  ["supabase/migrations/20260602_initial_next_foundation.sql", "encode(gen_random_bytes(32), 'hex')"],
  ["supabase/migrations/20260605_review_public_rpc_security.sql", "revoke select on public.deliverables from anon"],
  ["supabase/migrations/20260607_operational_backend_foundation.sql", "create table if not exists public.activity_log"],
  ["supabase/migrations/20260607_operational_backend_foundation.sql", "create table if not exists public.tasks"],
  ["supabase/migrations/20260607_operational_backend_foundation.sql", "public.log_activity"],
  ["supabase/migrations/20260608_client_project_completeness.sql", "alter table public.clients add column if not exists person_type"],
  ["supabase/migrations/20260608_client_project_completeness.sql", "reference_links"],
  ["supabase/migrations/20260609_commercial_proposals.sql", "create table if not exists public.commercial_proposals"],
  ["supabase/migrations/20260610_backend_security_hardening.sql", "public.is_valid_review_token"],
  ["supabase/migrations/20260610_backend_security_hardening.sql", "revoke select on public.deliverables from anon"],
  ["supabase/migrations/20260610_backend_security_hardening.sql", "comment content length is invalid"],
  ["src/lib/workspace-state.ts", "CommercialProposal"],
  ["src/hooks/use-workspace-state.tsx", "convertProposalToProject"],
  ["src/features/clients/clients-page.tsx", "Pipeline comercial"],
  ["src/lib/workspace-state.ts", "personType"],
  ["src/features/clients/clients-page.tsx", "CPF/CNPJ"],
];

const failures = [];

for (const file of requiredFiles) {
  if (!existsSync(file)) failures.push(`Arquivo obrigatório ausente: ${file}`);
}

for (const [file, content] of requiredContents) {
  if (!existsSync(file)) continue;
  const source = readFileSync(file, "utf8");
  if (!source.includes(content)) failures.push(`Conteúdo esperado não encontrado em ${file}: ${content}`);
}

if (failures.length) {
  console.error("Smoke check falhou:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Smoke check OK: rotas, migrations e segurança base presentes.");
