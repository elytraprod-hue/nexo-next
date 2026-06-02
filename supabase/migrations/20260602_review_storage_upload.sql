insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-videos',
  'review-videos',
  true,
  1073741824,
  array[
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-m4v',
    'application/vnd.apple.mpegurl'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read review videos" on storage.objects;
drop policy if exists "Authenticated can upload review videos" on storage.objects;
drop policy if exists "Authenticated can update review videos" on storage.objects;
drop policy if exists "Authenticated can delete review videos" on storage.objects;

create or replace function public.can_manage_review_storage_path(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  workspace_text text;
begin
  workspace_text := (storage.foldername(object_name))[1];

  if workspace_text is null then
    return false;
  end if;

  return public.is_workspace_member(workspace_text::uuid);
exception
  when others then
    return false;
end;
$$;

create policy "Public can read review videos"
  on storage.objects for select
  using (bucket_id = 'review-videos');

create policy "Authenticated can upload review videos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'review-videos' and public.can_manage_review_storage_path(name));

create policy "Authenticated can update review videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'review-videos' and public.can_manage_review_storage_path(name))
  with check (bucket_id = 'review-videos' and public.can_manage_review_storage_path(name));

create policy "Authenticated can delete review videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'review-videos' and public.can_manage_review_storage_path(name));
