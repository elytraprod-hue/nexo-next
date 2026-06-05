import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityLogRecord, NotificationRecord, OperationalTask } from "@/types/operations";

type ActivityLogRow = {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  entity_type: ActivityLogRecord["entityType"];
  entity_id: string | null;
  action: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type NotificationRow = {
  id: string;
  workspace_id: string;
  recipient_id: string | null;
  type: NotificationRecord["type"];
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type TaskRow = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  client_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  stage: string | null;
  status: OperationalTask["status"];
  priority: OperationalTask["priority"];
  due_at: string | null;
  completed_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function mapActivity(row: ActivityLogRow): ActivityLogRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    actorId: row.actor_id ?? undefined,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    action: row.action,
    title: row.title,
    description: row.description ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    recipientId: row.recipient_id ?? undefined,
    type: row.type,
    title: row.title,
    body: row.body ?? undefined,
    href: row.href ?? undefined,
    readAt: row.read_at ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapTask(row: TaskRow): OperationalTask {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    projectId: row.project_id ?? undefined,
    clientId: row.client_id ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    stage: row.stage ?? undefined,
    status: row.status,
    priority: row.priority,
    dueAt: row.due_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function logActivity(
  supabase: SupabaseClient,
  input: {
    action: string;
    description?: string;
    entityId?: string;
    entityType: ActivityLogRecord["entityType"];
    metadata?: Record<string, unknown>;
    title: string;
    workspaceId: string;
  },
) {
  const { error } = await supabase.rpc("log_activity", {
    p_action: input.action,
    p_description: input.description ?? null,
    p_entity_id: input.entityId ?? null,
    p_entity_type: input.entityType,
    p_metadata: input.metadata ?? {},
    p_title: input.title,
    p_workspace_id: input.workspaceId,
  });

  if (error) throw error;
}

export async function listActivityLog(supabase: SupabaseClient, workspaceId: string, limit = 30) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("id,workspace_id,actor_id,entity_type,entity_id,action,title,description,metadata,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<ActivityLogRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapActivity);
}

export async function listNotifications(supabase: SupabaseClient, workspaceId: string, limit = 20) {
  const { data, error } = await supabase
    .from("notifications")
    .select("id,workspace_id,recipient_id,type,title,body,href,read_at,metadata,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<NotificationRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function listOpenTasks(supabase: SupabaseClient, workspaceId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id,workspace_id,project_id,client_id,assigned_to,title,description,stage,status,priority,due_at,completed_at,metadata,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .neq("status", "done")
    .order("due_at", { ascending: true, nullsFirst: false })
    .returns<TaskRow[]>();

  if (error) throw error;
  return (data ?? []).map(mapTask);
}
