alter table public.clients add column if not exists person_type text not null default 'empresa';
alter table public.clients add column if not exists document_number text;
alter table public.clients add column if not exists instagram text;
alter table public.clients add column if not exists site_url text;
alter table public.clients add column if not exists address text;
alter table public.clients add column if not exists primary_contact text;
alter table public.clients add column if not exists communication_history jsonb not null default '[]'::jsonb;
alter table public.clients add column if not exists file_links jsonb not null default '[]'::jsonb;
alter table public.clients add column if not exists tags jsonb not null default '[]'::jsonb;

alter table public.projects add column if not exists briefing text;
alter table public.projects add column if not exists reference_links jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists shoot_date date;
alter table public.projects add column if not exists delivery_date date;
alter table public.projects add column if not exists crew jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists priority text not null default 'normal';
alter table public.projects add column if not exists links jsonb not null default '[]'::jsonb;
alter table public.projects add column if not exists approvals jsonb not null default '[]'::jsonb;

update public.projects
set delivery_date = coalesce(delivery_date, deadline)
where delivery_date is null;

create index if not exists clients_workspace_status_idx on public.clients (workspace_id, status, created_at desc);
create index if not exists clients_workspace_tags_idx on public.clients using gin (tags);
create index if not exists projects_workspace_delivery_idx on public.projects (workspace_id, delivery_date, status);
create index if not exists projects_workspace_priority_idx on public.projects (workspace_id, priority, status);
