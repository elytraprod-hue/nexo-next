alter table public.workspace_members
  add column if not exists email text,
  add column if not exists status text not null default 'active';

alter table public.workspace_members
  drop constraint if exists workspace_members_status_check;

alter table public.workspace_members
  add constraint workspace_members_status_check
  check (status in ('active', 'pending', 'blocked'));

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
      and coalesce(wm.status, 'active') = 'active'
  );
$$;

create index if not exists workspace_members_status_idx on public.workspace_members(status);
create index if not exists workspace_members_email_idx on public.workspace_members(email);
