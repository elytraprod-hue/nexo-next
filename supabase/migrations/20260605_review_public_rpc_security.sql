drop policy if exists "Public review can read deliverables by token" on public.deliverables;
drop policy if exists "Public review can update deliverable status" on public.deliverables;
drop policy if exists "Public review can read comments" on public.video_comments;
drop policy if exists "Public review can insert comments" on public.video_comments;

revoke select on public.deliverables from anon;
revoke update (status, updated_at) on public.deliverables from anon;
revoke select, insert on public.video_comments from anon;

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
begin
  select *
  into deliverable_row
  from public.deliverables
  where review_token = p_review_token
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
        'author_email', vc.author_email,
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
begin
  if length(trim(coalesce(p_content, ''))) = 0 then
    raise exception 'comment content is required';
  end if;

  select id
  into deliverable_id
  from public.deliverables
  where review_token = p_review_token
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
    greatest(coalesce(p_timestamp_seconds, 0), 0),
    coalesce(nullif(trim(p_timecode), ''), '00:00'),
    coalesce(nullif(trim(p_author_name), ''), 'Cliente'),
    nullif(trim(coalesce(p_author_email, '')), ''),
    'client',
    trim(p_content)
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
    'author_email', comment_row.author_email,
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
begin
  if p_status not in ('waiting_review', 'revision_requested', 'approved_with_changes', 'rejected', 'approved') then
    raise exception 'invalid review status';
  end if;

  update public.deliverables
  set status = p_status,
      updated_at = now()
  where review_token = p_review_token
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

revoke all on function public.get_public_review(text) from public;
revoke all on function public.add_public_review_comment(text, numeric, text, text, text, text) from public;
revoke all on function public.set_public_review_status(text, text) from public;

grant execute on function public.get_public_review(text) to anon, authenticated;
grant execute on function public.add_public_review_comment(text, numeric, text, text, text, text) to anon, authenticated;
grant execute on function public.set_public_review_status(text, text) to anon, authenticated;
