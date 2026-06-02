import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ReviewDeliverable, ReviewStatus, VideoComment } from "@/types/review";

type DeliverableRow = {
  id: string;
  project_id?: string | null;
  title: string;
  version?: number | null;
  video_url: string;
  public_url?: string | null;
  drive_file_id?: string | null;
  video_source?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  review_token: string;
  status: ReviewStatus;
  revision_round?: number | null;
  expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CommentRow = {
  id: string;
  deliverable_id: string;
  parent_id?: string | null;
  timestamp_seconds?: number | null;
  timecode?: string | null;
  author_name: string;
  author_email?: string | null;
  author_type?: "client" | "producer" | "admin" | null;
  content: string;
  resolved?: boolean | null;
  resolved_at?: string | null;
  created_at?: string | null;
};

function mapDeliverable(row: DeliverableRow): ReviewDeliverable {
  return {
    id: row.id,
    projectId: row.project_id ?? undefined,
    title: row.title,
    version: row.version ?? 1,
    videoUrl: row.video_url,
    publicUrl: row.public_url ?? undefined,
    driveFileId: row.drive_file_id ?? undefined,
    videoSource: row.video_source === "hls" ? "hls" : row.video_source === "drive" ? "drive" : "direct",
    thumbnailUrl: row.thumbnail_url ?? undefined,
    durationSeconds: row.duration_seconds ?? undefined,
    reviewToken: row.review_token,
    status: row.status,
    revisionRound: row.revision_round ?? 1,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

function mapComment(row: CommentRow): VideoComment {
  return {
    id: row.id,
    deliverableId: row.deliverable_id,
    parentId: row.parent_id ?? undefined,
    timestampSeconds: row.timestamp_seconds ?? 0,
    timecode: row.timecode ?? "00:00",
    authorName: row.author_name,
    authorEmail: row.author_email ?? undefined,
    authorType: row.author_type ?? "client",
    content: row.content,
    resolved: Boolean(row.resolved),
    resolvedAt: row.resolved_at ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export async function getDeliverableByToken(token: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !token) return null;

  const { data, error } = await supabase
    .from("deliverables")
    .select(
      "id,project_id,title,version,video_url,public_url,drive_file_id,video_source,thumbnail_url,duration_seconds,review_token,status,revision_round,expires_at,created_at,updated_at",
    )
    .eq("review_token", token)
    .limit(1)
    .maybeSingle<DeliverableRow>();

  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;

  return mapDeliverable(data);
}

export async function getCommentsByDeliverable(deliverableId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !deliverableId) return [];

  const { data, error } = await supabase
    .from("video_comments")
    .select("id,deliverable_id,parent_id,timestamp_seconds,timecode,author_name,author_email,author_type,content,resolved,resolved_at,created_at")
    .eq("deliverable_id", deliverableId)
    .order("timestamp_seconds", { ascending: true })
    .returns<CommentRow[]>();

  if (error || !data) return [];

  return data.map(mapComment);
}

export async function createVideoComment(payload: {
  deliverableId: string;
  timestampSeconds: number;
  timecode: string;
  authorName: string;
  authorEmail?: string;
  authorType: "client" | "producer" | "admin";
  content: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("video_comments")
    .insert({
      deliverable_id: payload.deliverableId,
      timestamp_seconds: payload.timestampSeconds,
      timecode: payload.timecode,
      author_name: payload.authorName,
      author_email: payload.authorEmail || null,
      author_type: payload.authorType,
      content: payload.content,
    })
    .select("id,deliverable_id,parent_id,timestamp_seconds,timecode,author_name,author_email,author_type,content,resolved,resolved_at,created_at")
    .single<CommentRow>();

  if (error || !data) return null;

  return mapComment(data);
}

export async function updateDeliverableStatus(deliverableId: string, status: ReviewStatus) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("deliverables")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", deliverableId)
    .select(
      "id,project_id,title,version,video_url,public_url,drive_file_id,video_source,thumbnail_url,duration_seconds,review_token,status,revision_round,expires_at,created_at,updated_at",
    )
    .single<DeliverableRow>();

  if (error || !data) return null;

  return mapDeliverable(data);
}
