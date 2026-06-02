create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  plan text not null default 'starter',
  legal_name text,
  document_number text,
  logo_url text,
  address text,
  phone text,
  email text,
  site_url text,
  social_links jsonb not null default '{}'::jsonb,
  default_signature text,
  bank_info text,
  fiscal_info text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  whatsapp text,
  company text,
  role text,
  lead_source text,
  referral text,
  acquisition_channel text,
  contact_reason text,
  desired_service text,
  estimated_budget numeric(12,2),
  assigned_to text,
  contact_history jsonb not null default '[]'::jsonb,
  relationship_type text not null default 'cliente',
  status text not null default 'lead',
  lead_temp text not null default 'morno',
  payment text not null default 'pendente',
  service text,
  value numeric(12,2),
  monthly_value numeric(12,2),
  partner_terms text,
  freelancer_role text,
  freelancer_rate numeric(12,2),
  next_action text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  preset_id text,
  type text,
  status text not null default 'briefing',
  deadline date,
  budget numeric(12,2),
  link text,
  pipeline jsonb not null default '{}'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  version integer not null default 1,
  video_url text not null,
  public_url text,
  drive_file_id text,
  video_source text not null default 'direct',
  thumbnail_url text,
  duration_seconds numeric(8,2),
  review_token text unique not null default encode(gen_random_bytes(32), 'hex'),
  status text not null default 'waiting_review',
  revision_round integer not null default 1,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.video_comments (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  parent_id uuid references public.video_comments(id) on delete cascade,
  timestamp_seconds numeric(8,2) not null default 0,
  timecode text not null default '00:00',
  author_name text not null,
  author_email text,
  author_type text not null default 'client',
  content text not null,
  resolved boolean not null default false,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.document_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  doc_type text not null,
  title text not null,
  preset_id text,
  payload jsonb not null default '{}'::jsonb,
  summary text,
  html text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  label text not null,
  type text not null default 'receivable',
  amount numeric(12,2) not null default 0,
  status text not null default 'open',
  due_at date not null default current_date,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspace_members add column if not exists id uuid default gen_random_uuid();
alter table public.workspaces add column if not exists legal_name text;
alter table public.workspaces add column if not exists document_number text;
alter table public.workspaces add column if not exists logo_url text;
alter table public.workspaces add column if not exists address text;
alter table public.workspaces add column if not exists phone text;
alter table public.workspaces add column if not exists email text;
alter table public.workspaces add column if not exists site_url text;
alter table public.workspaces add column if not exists social_links jsonb not null default '{}'::jsonb;
alter table public.workspaces add column if not exists default_signature text;
alter table public.workspaces add column if not exists bank_info text;
alter table public.workspaces add column if not exists fiscal_info text;
alter table public.clients add column if not exists status text not null default 'lead';
alter table public.clients add column if not exists lead_temp text not null default 'morno';
alter table public.clients add column if not exists payment text not null default 'pendente';
alter table public.clients add column if not exists value numeric(12,2);
alter table public.clients add column if not exists notes text;
alter table public.clients add column if not exists whatsapp text;
alter table public.clients add column if not exists role text;
alter table public.clients add column if not exists lead_source text;
alter table public.clients add column if not exists referral text;
alter table public.clients add column if not exists acquisition_channel text;
alter table public.clients add column if not exists contact_reason text;
alter table public.clients add column if not exists desired_service text;
alter table public.clients add column if not exists estimated_budget numeric(12,2);
alter table public.clients add column if not exists assigned_to text;
alter table public.clients add column if not exists contact_history jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists type text;
alter table public.projects add column if not exists link text;
alter table public.projects add column if not exists checklist jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists deliverables jsonb not null default '[]'::jsonb;
alter table public.deliverables add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade;
alter table public.document_generations add column if not exists preset_id text;
alter table public.document_generations add column if not exists summary text;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

drop trigger if exists deliverables_set_updated_at on public.deliverables;
create trigger deliverables_set_updated_at
before update on public.deliverables
for each row execute function public.set_updated_at();

drop trigger if exists finance_entries_set_updated_at on public.finance_entries;
create trigger finance_entries_set_updated_at
before update on public.finance_entries
for each row execute function public.set_updated_at();

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.can_manage_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = target_project_id
      and public.is_workspace_member(p.workspace_id)
  );
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.video_comments enable row level security;
alter table public.document_generations enable row level security;
alter table public.finance_entries enable row level security;

drop policy if exists "Members can read workspace" on public.workspaces;
drop policy if exists "Authenticated can create owned workspaces" on public.workspaces;
drop policy if exists "Owners can manage workspace" on public.workspaces;
drop policy if exists "Members can read workspace members" on public.workspace_members;
drop policy if exists "Owners can manage workspace members" on public.workspace_members;
drop policy if exists "Members can manage clients" on public.clients;
drop policy if exists "Members can manage projects" on public.projects;
drop policy if exists "Members can manage deliverables" on public.deliverables;
drop policy if exists "Public review can read deliverables by token" on public.deliverables;
drop policy if exists "Public review can update deliverable status" on public.deliverables;
drop policy if exists "Members can manage comments" on public.video_comments;
drop policy if exists "Public review can read comments" on public.video_comments;
drop policy if exists "Public review can insert comments" on public.video_comments;
drop policy if exists "Members can manage documents" on public.document_generations;
drop policy if exists "Members can manage finance entries" on public.finance_entries;

create policy "Members can read workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated can create owned workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Owners can manage workspace"
  on public.workspaces for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Members can read workspace members"
  on public.workspace_members for select
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

create policy "Owners can manage workspace members"
  on public.workspace_members for all
  using (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_members.workspace_id
        and w.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workspaces w
      where w.id = workspace_members.workspace_id
        and w.owner_id = auth.uid()
    )
  );

create policy "Members can manage clients"
  on public.clients for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Members can manage projects"
  on public.projects for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Members can manage deliverables"
  on public.deliverables for all
  using (
    (workspace_id is not null and public.is_workspace_member(workspace_id))
    or (project_id is not null and public.can_manage_project(project_id))
  )
  with check (
    (workspace_id is not null and public.is_workspace_member(workspace_id))
    or (project_id is not null and public.can_manage_project(project_id))
  );

create policy "Public review can read deliverables by token"
  on public.deliverables for select
  using (review_token is not null and (expires_at is null or expires_at > now()));

create policy "Public review can update deliverable status"
  on public.deliverables for update
  using (review_token is not null and (expires_at is null or expires_at > now()))
  with check (
    review_token is not null
    and (expires_at is null or expires_at > now())
    and status in ('waiting_review', 'revision_requested', 'approved_with_changes', 'rejected', 'approved')
  );

create policy "Members can manage comments"
  on public.video_comments for all
  using (
    exists (
      select 1
      from public.deliverables d
      where d.id = video_comments.deliverable_id
        and (
          (d.workspace_id is not null and public.is_workspace_member(d.workspace_id))
          or (d.project_id is not null and public.can_manage_project(d.project_id))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.deliverables d
      where d.id = video_comments.deliverable_id
        and (
          (d.workspace_id is not null and public.is_workspace_member(d.workspace_id))
          or (d.project_id is not null and public.can_manage_project(d.project_id))
        )
    )
  );

create policy "Public review can read comments"
  on public.video_comments for select
  using (
    exists (
      select 1
      from public.deliverables d
      where d.id = video_comments.deliverable_id
        and d.review_token is not null
        and (d.expires_at is null or d.expires_at > now())
    )
  );

create policy "Public review can insert comments"
  on public.video_comments for insert
  with check (
    exists (
      select 1
      from public.deliverables d
      where d.id = video_comments.deliverable_id
        and d.review_token is not null
        and (d.expires_at is null or d.expires_at > now())
    )
  );

create policy "Members can manage documents"
  on public.document_generations for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Members can manage finance entries"
  on public.finance_entries for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.deliverables to authenticated;
grant select, insert, update, delete on public.video_comments to authenticated;
grant select, insert, update, delete on public.document_generations to authenticated;
grant select, insert, update, delete on public.finance_entries to authenticated;
grant select on public.deliverables to anon;
grant update (status, updated_at) on public.deliverables to anon;
grant select, insert on public.video_comments to anon;

create index if not exists workspaces_owner_idx on public.workspaces(owner_id);
create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists workspace_members_workspace_idx on public.workspace_members(workspace_id);
create index if not exists deliverables_review_token_idx on public.deliverables(review_token);
create index if not exists deliverables_project_idx on public.deliverables(project_id);
create index if not exists deliverables_workspace_idx on public.deliverables(workspace_id);
create index if not exists video_comments_deliverable_time_idx on public.video_comments(deliverable_id, timestamp_seconds);
create index if not exists projects_workspace_status_idx on public.projects(workspace_id, status);
create index if not exists clients_workspace_relation_idx on public.clients(workspace_id, relationship_type);
create index if not exists finance_entries_workspace_due_idx on public.finance_entries(workspace_id, due_at);
create index if not exists document_generations_workspace_idx on public.document_generations(workspace_id, created_at);
