create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  stage text,
  status text not null default 'open',
  priority text not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  name text not null,
  bucket text,
  storage_path text,
  public_url text,
  mime_type text,
  size_bytes bigint,
  kind text not null default 'asset',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  document_id uuid references public.document_generations(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  signer_name text,
  signer_email text,
  signed_at timestamptz,
  expires_at timestamptz,
  pdf_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverable_versions (
  id uuid primary key default gen_random_uuid(),
  deliverable_id uuid not null references public.deliverables(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  version integer not null,
  title text not null,
  video_url text not null,
  video_source text not null default 'direct',
  thumbnail_url text,
  duration_seconds numeric(8,2),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (deliverable_id, version)
);

create index if not exists activity_log_workspace_created_idx on public.activity_log (workspace_id, created_at desc);
create index if not exists notifications_recipient_created_idx on public.notifications (recipient_id, created_at desc);
create index if not exists tasks_workspace_due_idx on public.tasks (workspace_id, due_at, status);
create index if not exists files_workspace_project_idx on public.files (workspace_id, project_id, created_at desc);
create index if not exists contracts_workspace_status_idx on public.contracts (workspace_id, status, created_at desc);
create index if not exists deliverable_versions_deliverable_idx on public.deliverable_versions (deliverable_id, version desc);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists files_set_updated_at on public.files;
create trigger files_set_updated_at
before update on public.files
for each row execute function public.set_updated_at();

drop trigger if exists contracts_set_updated_at on public.contracts;
create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

alter table public.activity_log enable row level security;
alter table public.notifications enable row level security;
alter table public.tasks enable row level security;
alter table public.files enable row level security;
alter table public.contracts enable row level security;
alter table public.deliverable_versions enable row level security;

drop policy if exists "Members can read activity log" on public.activity_log;
create policy "Members can read activity log"
on public.activity_log for select
using (public.is_workspace_member(workspace_id));

drop policy if exists "Members can insert activity log" on public.activity_log;
create policy "Members can insert activity log"
on public.activity_log for insert
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can read notifications" on public.notifications;
create policy "Members can read notifications"
on public.notifications for select
using (public.is_workspace_member(workspace_id) and (recipient_id is null or recipient_id = auth.uid()));

drop policy if exists "Members can manage notifications" on public.notifications;
create policy "Members can manage notifications"
on public.notifications for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage tasks" on public.tasks;
create policy "Members can manage tasks"
on public.tasks for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage files" on public.files;
create policy "Members can manage files"
on public.files for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage contracts" on public.contracts;
create policy "Members can manage contracts"
on public.contracts for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

drop policy if exists "Members can manage deliverable versions" on public.deliverable_versions;
create policy "Members can manage deliverable versions"
on public.deliverable_versions for all
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create or replace function public.log_activity(
  p_workspace_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_title text,
  p_description text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  next_id uuid;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'workspace access denied';
  end if;

  insert into public.activity_log (
    workspace_id,
    actor_id,
    entity_type,
    entity_id,
    action,
    title,
    description,
    metadata
  )
  values (
    p_workspace_id,
    auth.uid(),
    p_entity_type,
    p_entity_id,
    p_action,
    p_title,
    p_description,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into next_id;

  return next_id;
end;
$$;

create or replace function public.create_workspace_notification(
  p_workspace_id uuid,
  p_recipient_id uuid,
  p_type text,
  p_title text,
  p_body text default null,
  p_href text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  next_id uuid;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'workspace access denied';
  end if;

  insert into public.notifications (
    workspace_id,
    recipient_id,
    type,
    title,
    body,
    href,
    metadata
  )
  values (
    p_workspace_id,
    p_recipient_id,
    coalesce(nullif(trim(p_type), ''), 'system'),
    p_title,
    p_body,
    p_href,
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into next_id;

  return next_id;
end;
$$;

revoke all on function public.log_activity(uuid, text, uuid, text, text, text, jsonb) from public;
revoke all on function public.create_workspace_notification(uuid, uuid, text, text, text, text, jsonb) from public;
grant execute on function public.log_activity(uuid, text, uuid, text, text, text, jsonb) to authenticated;
grant execute on function public.create_workspace_notification(uuid, uuid, text, text, text, text, jsonb) to authenticated;
