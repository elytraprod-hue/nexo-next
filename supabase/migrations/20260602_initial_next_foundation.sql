create extension if not exists pgcrypto;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references auth.users(id) on delete set null,
  plan text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  relationship_type text not null default 'cliente',
  service text,
  monthly_value numeric(12,2),
  partner_terms text,
  freelancer_role text,
  freelancer_rate numeric(12,2),
  next_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  title text not null,
  preset_id text,
  status text not null default 'briefing',
  deadline date,
  budget numeric(12,2),
  pipeline jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
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

create table public.video_comments (
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

create table public.document_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  doc_type text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  html text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.video_comments enable row level security;
alter table public.document_generations enable row level security;

create policy "Members can read workspace"
  on public.workspaces for select
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = workspaces.id and wm.user_id = auth.uid()
  ));

create policy "Members can manage clients"
  on public.clients for all
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = clients.workspace_id and wm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = clients.workspace_id and wm.user_id = auth.uid()
  ));

create policy "Members can manage projects"
  on public.projects for all
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = projects.workspace_id and wm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = projects.workspace_id and wm.user_id = auth.uid()
  ));

create policy "Public review can read deliverables by token"
  on public.deliverables for select
  using (review_token is not null and (expires_at is null or expires_at > now()));

create policy "Authenticated users can manage deliverables"
  on public.deliverables for all
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "Public review can read comments"
  on public.video_comments for select
  using (exists (
    select 1 from public.deliverables d
    where d.id = video_comments.deliverable_id
      and d.review_token is not null
      and (d.expires_at is null or d.expires_at > now())
  ));

create policy "Public review can insert comments"
  on public.video_comments for insert
  with check (exists (
    select 1 from public.deliverables d
    where d.id = video_comments.deliverable_id
      and d.review_token is not null
      and (d.expires_at is null or d.expires_at > now())
  ));

create policy "Members can manage documents"
  on public.document_generations for all
  using (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = document_generations.workspace_id and wm.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = document_generations.workspace_id and wm.user_id = auth.uid()
  ));

create index deliverables_review_token_idx on public.deliverables(review_token);
create index deliverables_project_idx on public.deliverables(project_id);
create index video_comments_deliverable_time_idx on public.video_comments(deliverable_id, timestamp_seconds);
create index projects_workspace_status_idx on public.projects(workspace_id, status);
create index clients_workspace_relation_idx on public.clients(workspace_id, relationship_type);
