export type ReviewStatus = "waiting_review" | "revision_requested" | "approved_with_changes" | "rejected" | "approved";

export type ReviewDeliverable = {
  id: string;
  projectId?: string;
  title: string;
  version?: number;
  videoUrl: string;
  publicUrl?: string;
  driveFileId?: string;
  videoSource: "direct" | "hls" | "drive";
  thumbnailUrl?: string;
  durationSeconds?: number;
  reviewToken: string;
  status: ReviewStatus;
  revisionRound?: number;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  comments?: VideoComment[];
};

export type VideoComment = {
  id: string;
  deliverableId: string;
  parentId?: string;
  timestampSeconds: number;
  timecode: string;
  authorName: string;
  authorEmail?: string;
  authorType: "client" | "producer" | "admin";
  content: string;
  resolved: boolean;
  resolvedAt?: string;
  createdAt: string;
};
