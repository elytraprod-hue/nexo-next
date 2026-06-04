alter table public.workspace_members
  add constraint workspace_members_role_check
  check (role in ('owner', 'admin', 'member', 'client', 'viewer'));

create or replace function public.user_workspace_role(target_workspace_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select wm.role
  from public.workspace_members wm
  where wm.workspace_id = target_workspace_id
    and wm.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
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
      and wm.role = 'owner'
  )
  or exists (
    select 1
    from public.workspaces w
    where w.id = target_workspace_id
      and w.owner_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
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
      and wm.role in ('owner', 'admin')
  );
$$;

create or replace function public.can_manage_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_workspace_owner(target_workspace_id)
    or public.is_workspace_admin(target_workspace_id);
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
drop policy if exists "Members can manage comments" on public.video_comments;
drop policy if exists "Members can manage documents" on public.document_generations;
drop policy if exists "Members can manage finance entries" on public.finance_entries;
drop policy if exists "Public review can read deliverables by token" on public.deliverables;
drop policy if exists "Public review can update deliverable status" on public.deliverables;
drop policy if exists "Public review can read comments" on public.video_comments;
drop policy if exists "Public review can insert comments" on public.video_comments;

create policy "Members can read workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated can create owned workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Owners and admins can update workspace"
  on public.workspaces for update
  using (public.can_manage_workspace(id))
  with check (public.can_manage_workspace(id));

create policy "Members can read workspace members"
  on public.workspace_members for select
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

create policy "Owners and admins can manage workspace members"
  on public.workspace_members for all
  using (public.can_manage_workspace(workspace_id))
  with check (public.can_manage_workspace(workspace_id));

create policy "Workspace members can manage clients"
  on public.clients for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can manage projects"
  on public.projects for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can manage deliverables"
  on public.deliverables for all
  using (public.is_workspace_member(workspace_id) or exists (select 1 from public.projects p where p.id = deliverables.project_id and public.is_workspace_member(p.workspace_id)))
  with check (public.is_workspace_member(workspace_id) or exists (select 1 from public.projects p where p.id = deliverables.project_id and public.is_workspace_member(p.workspace_id)));

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

create policy "Workspace members can manage comments"
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

create policy "Workspace members can manage documents"
  on public.document_generations for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can manage finance entries"
  on public.finance_entries for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create index if not exists workspace_members_role_idx on public.workspace_members(role);
