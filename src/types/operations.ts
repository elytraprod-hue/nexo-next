export type ActivityLogRecord = {
  id: string;
  workspaceId: string;
  actorId?: string;
  entityType: "client" | "project" | "document" | "review" | "finance" | "task" | "file" | "contract" | "workspace";
  entityId?: string;
  action: string;
  title: string;
  description?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type NotificationRecord = {
  id: string;
  workspaceId: string;
  recipientId?: string;
  type: "system" | "review" | "project" | "finance" | "document" | "client";
  title: string;
  body?: string;
  href?: string;
  readAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type OperationalTask = {
  id: string;
  workspaceId: string;
  projectId?: string;
  clientId?: string;
  assignedTo?: string;
  title: string;
  description?: string;
  stage?: string;
  status: "open" | "doing" | "done" | "blocked";
  priority: "low" | "normal" | "high" | "urgent";
  dueAt?: string;
  completedAt?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
