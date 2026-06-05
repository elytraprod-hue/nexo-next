create table if not exists public.commercial_proposals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  preset_id text not null default 'institucional',
  scope text not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'draft',
  valid_until date not null default (current_date + 7),
  expected_close_date date not null default (current_date + 3),
  loss_reason text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commercial_proposals_workspace_status_idx on public.commercial_proposals (workspace_id, status, expected_close_date);
create index if not exists commercial_proposals_client_idx on public.commercial_proposals (client_id, created_at desc);

drop trigger if exists commercial_proposals_set_updated_at on public.commercial_proposals;
create trigger commercial_proposals_set_updated_at
before update on public.commercial_proposals
for each row execute function public.set_updated_at();

alter table public.commercial_proposals enable row level security;

drop policy if exists "Members can manage commercial proposals" on public.commercial_proposals;
create policy "Members can manage commercial proposals"
on public.commercial_proposals for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));
