import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ReviewDeliverable, ReviewStatus, VideoComment } from "@/types/review";

export const REVIEW_VIDEO_BUCKET = "review-videos";

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

type CreateReviewDeliverableInput = {
  projectId?: string;
  publicUrl?: string;
  reviewToken: string;
  title: string;
  videoSource: ReviewDeliverable["videoSource"];
  videoUrl: string;
  workspaceId: string;
};

type PublicReviewPayload = {
  deliverable?: DeliverableRow | null;
  comments?: CommentRow[] | null;
} | null;

function selectDeliverableColumns() {
  return "id,project_id,title,version,video_url,public_url,drive_file_id,video_source,thumbnail_url,duration_seconds,review_token,status,revision_round,expires_at,created_at,updated_at";
}

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

export function createReviewToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `rvw-${crypto.randomUUID()}`;
  return `rvw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function inferReviewVideoSource(url: string, fallback: ReviewDeliverable["videoSource"] = "direct"): ReviewDeliverable["videoSource"] {
  const normalized = url.toLowerCase();
  if (normalized.includes(".m3u8")) return "hls";
  if (normalized.includes("drive.google.com")) return "drive";
  return fallback;
}

export function getGoogleDriveFileId(url: string) {
  const trimmed = url.trim();
  if (!trimmed.includes("drive.google.com")) return "";

  const fileMatch = trimmed.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) return fileMatch[1];

  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("id") ?? "";
  } catch {
    return "";
  }
}

export function normalizeReviewVideoUrl(url: string, source: ReviewDeliverable["videoSource"]) {
  const trimmed = url.trim();
  if (source !== "drive") return trimmed;

  const fileId = getGoogleDriveFileId(trimmed);
  return fileId ? `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}` : trimmed;
}

function sanitizeFileName(name: string) {
  const [base = "video", ...extensionParts] = name.split(".");
  const extension = extensionParts.length ? `.${extensionParts.pop()?.toLowerCase()}` : "";
  const safeBase = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeBase || "video"}${extension}`;
}

export async function uploadReviewVideoFile(input: {
  file: File;
  reviewToken: string;
  workspaceId: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado.");

  const safeName = sanitizeFileName(input.file.name);
  const path = `${input.workspaceId}/${input.reviewToken}/${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage.from(REVIEW_VIDEO_BUCKET).upload(path, input.file, {
    cacheControl: "3600",
    contentType: input.file.type || "video/mp4",
    upsert: false,
  });

  if (error) throw error;

  const { data: publicData } = supabase.storage.from(REVIEW_VIDEO_BUCKET).getPublicUrl(data.path);

  return {
    path: data.path,
    videoUrl: publicData.publicUrl,
  };
}

export async function createReviewDeliverable(input: CreateReviewDeliverableInput) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase não configurado.");

  const { data, error } = await supabase
    .from("deliverables")
    .insert({
      workspace_id: input.workspaceId,
      project_id: input.projectId || null,
      title: input.title.trim() || "Review de vídeo",
      review_token: input.reviewToken,
      video_url: input.videoUrl,
      public_url: input.publicUrl || null,
      video_source: input.videoSource,
      status: "waiting_review",
      revision_round: 1,
      version: 1,
    })
    .select(selectDeliverableColumns())
    .single<DeliverableRow>();

  if (error) throw error;

  return mapDeliverable(data);
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

function mapPublicReviewPayload(payload: PublicReviewPayload) {
  if (!payload?.deliverable) return null;

  return {
    ...mapDeliverable(payload.deliverable),
    comments: (payload.comments ?? []).map(mapComment),
  };
}

export async function getPublicReviewByToken(token: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase || !token) return null;

  const { data, error } = await supabase.rpc("get_public_review", { p_review_token: token });
  if (error || !data) return null;

  return mapPublicReviewPayload(data as PublicReviewPayload);
}

export async function getDeliverableByToken(token: string) {
  return getPublicReviewByToken(token);
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

export async function createPublicVideoComment(payload: {
  reviewToken: string;
  timestampSeconds: number;
  timecode: string;
  authorName: string;
  authorEmail?: string;
  content: string;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("add_public_review_comment", {
    p_review_token: payload.reviewToken,
    p_timestamp_seconds: payload.timestampSeconds,
    p_timecode: payload.timecode,
    p_author_name: payload.authorName,
    p_author_email: payload.authorEmail || "",
    p_content: payload.content,
  });

  if (error || !data) return null;

  return mapComment(data as CommentRow);
}

export async function updateDeliverableStatus(deliverableId: string, status: ReviewStatus) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("deliverables")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", deliverableId)
    .select(selectDeliverableColumns())
    .single<DeliverableRow>();

  if (error || !data) return null;

  return mapDeliverable(data);
}

export async function updatePublicReviewStatus(reviewToken: string, status: ReviewStatus) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("set_public_review_status", {
    p_review_token: reviewToken,
    p_status: status,
  });

  if (error || !data) return null;

  return data as { id: string; review_token: string; status: ReviewStatus; updated_at?: string };
}
