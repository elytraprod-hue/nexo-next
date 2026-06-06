-- Security hardening for public review links and core operational records.
-- New migration only: do not edit previous migrations already applied in Supabase.

alter table public.deliverables
  drop constraint if exists deliverables_status_check,
  add constraint deliverables_status_check
  check (status in ('waiting_review', 'revision_requested', 'approved_with_changes', 'rejected', 'approved')) not valid;

alter table public.video_comments
  drop constraint if exists video_comments_author_type_check,
  add constraint video_comments_author_type_check
  check (author_type in ('client', 'producer', 'admin')) not valid;

alter table public.finance_entries
  drop constraint if exists finance_entries_type_check,
  add constraint finance_entries_type_check
  check (type in ('receivable', 'payable', 'received')) not valid;

alter table public.finance_entries
  drop constraint if exists finance_entries_status_check,
  add constraint finance_entries_status_check
  check (status in ('open', 'paid', 'late')) not valid;

alter table public.commercial_proposals
  drop constraint if exists commercial_proposals_status_check,
  add constraint commercial_proposals_status_check
  check (status in ('draft', 'sent', 'approved', 'lost', 'expired')) not valid;

create index if not exists deliverables_public_token_active_idx
  on public.deliverables (review_token, expires_at)
  where review_token is not null;

create or replace function public.is_valid_review_token(p_review_token text)
returns boolean
language sql
immutable
as $$
  select
    p_review_token is not null
    and length(trim(p_review_token)) between 16 and 96
    and trim(p_review_token) ~ '^[A-Za-z0-9_-]+$';
$$;

create or replace function public.get_public_review(p_review_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  deliverable_row public.deliverables%rowtype;
  comment_rows jsonb;
  safe_token text := trim(coalesce(p_review_token, ''));
begin
  if not public.is_valid_review_token(safe_token) then
    return null;
  end if;

  select *
  into deliverable_row
  from public.deliverables
  where review_token = safe_token
    and (expires_at is null or expires_at > now())
  limit 1;

  if deliverable_row.id is null then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', vc.id,
        'deliverable_id', vc.deliverable_id,
        'parent_id', vc.parent_id,
        'timestamp_seconds', vc.timestamp_seconds,
        'timecode', vc.timecode,
        'author_name', vc.author_name,
        'author_type', vc.author_type,
        'content', vc.content,
        'resolved', vc.resolved,
        'resolved_at', vc.resolved_at,
        'created_at', vc.created_at
      )
      order by vc.timestamp_seconds asc, vc.created_at asc
    ),
    '[]'::jsonb
  )
  into comment_rows
  from public.video_comments vc
  where vc.deliverable_id = deliverable_row.id;

  return jsonb_build_object(
    'deliverable',
    jsonb_build_object(
      'id', deliverable_row.id,
      'project_id', deliverable_row.project_id,
      'title', deliverable_row.title,
      'version', deliverable_row.version,
      'video_url', deliverable_row.video_url,
      'public_url', deliverable_row.public_url,
      'drive_file_id', deliverable_row.drive_file_id,
      'video_source', deliverable_row.video_source,
      'thumbnail_url', deliverable_row.thumbnail_url,
      'duration_seconds', deliverable_row.duration_seconds,
      'review_token', deliverable_row.review_token,
      'status', deliverable_row.status,
      'revision_round', deliverable_row.revision_round,
      'expires_at', deliverable_row.expires_at,
      'created_at', deliverable_row.created_at,
      'updated_at', deliverable_row.updated_at
    ),
    'comments',
    comment_rows
  );
end;
$$;

create or replace function public.add_public_review_comment(
  p_review_token text,
  p_timestamp_seconds numeric,
  p_timecode text,
  p_author_name text,
  p_author_email text,
  p_content text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deliverable_id uuid;
  comment_row public.video_comments%rowtype;
  safe_token text := trim(coalesce(p_review_token, ''));
  safe_content text := trim(coalesce(p_content, ''));
  safe_author text := left(coalesce(nullif(trim(p_author_name), ''), 'Cliente'), 80);
  safe_email text := nullif(left(trim(coalesce(p_author_email, '')), 160), '');
begin
  if not public.is_valid_review_token(safe_token) then
    raise exception 'review not found';
  end if;

  if length(safe_content) < 2 or length(safe_content) > 2000 then
    raise exception 'comment content length is invalid';
  end if;

  if safe_email is not null and safe_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
    raise exception 'invalid author email';
  end if;

  select id
  into deliverable_id
  from public.deliverables
  where review_token = safe_token
    and (expires_at is null or expires_at > now())
  limit 1;

  if deliverable_id is null then
    raise exception 'review not found';
  end if;

  insert into public.video_comments (
    deliverable_id,
    timestamp_seconds,
    timecode,
    author_name,
    author_email,
    author_type,
    content
  )
  values (
    deliverable_id,
    least(greatest(coalesce(p_timestamp_seconds, 0), 0), 86400),
    left(coalesce(nullif(trim(p_timecode), ''), '00:00'), 16),
    safe_author,
    safe_email,
    'client',
    safe_content
  )
  returning *
  into comment_row;

  return jsonb_build_object(
    'id', comment_row.id,
    'deliverable_id', comment_row.deliverable_id,
    'parent_id', comment_row.parent_id,
    'timestamp_seconds', comment_row.timestamp_seconds,
    'timecode', comment_row.timecode,
    'author_name', comment_row.author_name,
    'author_type', comment_row.author_type,
    'content', comment_row.content,
    'resolved', comment_row.resolved,
    'resolved_at', comment_row.resolved_at,
    'created_at', comment_row.created_at
  );
end;
$$;

create or replace function public.set_public_review_status(
  p_review_token text,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deliverable_row public.deliverables%rowtype;
  safe_token text := trim(coalesce(p_review_token, ''));
begin
  if not public.is_valid_review_token(safe_token) then
    raise exception 'review not found';
  end if;

  if p_status not in ('waiting_review', 'revision_requested', 'approved_with_changes', 'rejected', 'approved') then
    raise exception 'invalid review status';
  end if;

  update public.deliverables
  set status = p_status,
      updated_at = now()
  where review_token = safe_token
    and (expires_at is null or expires_at > now())
  returning *
  into deliverable_row;

  if deliverable_row.id is null then
    raise exception 'review not found';
  end if;

  return jsonb_build_object(
    'id', deliverable_row.id,
    'review_token', deliverable_row.review_token,
    'status', deliverable_row.status,
    'updated_at', deliverable_row.updated_at
  );
end;
$$;

revoke select on public.deliverables from anon;
revoke update (status, updated_at) on public.deliverables from anon;
revoke select, insert on public.video_comments from anon;

revoke all on function public.is_valid_review_token(text) from public;
revoke all on function public.get_public_review(text) from public;
revoke all on function public.add_public_review_comment(text, numeric, text, text, text, text) from public;
revoke all on function public.set_public_review_status(text, text) from public;

grant execute on function public.get_public_review(text) to anon, authenticated;
grant execute on function public.add_public_review_comment(text, numeric, text, text, text, text) to anon, authenticated;
grant execute on function public.set_public_review_status(text, text) to anon, authenticated;
