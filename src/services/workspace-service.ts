import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { RelationshipType } from "@/lib/constants";
import type { BusinessProfile, ClientRecord, FinanceEntry, ProjectRecord, StudioDocumentRecord, WorkspaceState } from "@/lib/workspace-state";

type WorkspaceRow = {
  id: string;
  name: string;
  legal_name: string | null;
  document_number: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  site_url: string | null;
  social_links: Record<string, string> | null;
  default_signature: string | null;
  bank_info: string | null;
  fiscal_info: string | null;
};

type ClientRow = {
  id: string;
  workspace_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  company: string | null;
  role: string | null;
  lead_source: string | null;
  referral: string | null;
  acquisition_channel: string | null;
  contact_reason: string | null;
  desired_service: string | null;
  estimated_budget: number | null;
  assigned_to: string | null;
  contact_history: string[] | null;
  relationship_type: RelationshipType;
  status: ClientRecord["status"] | null;
  lead_temp: ClientRecord["leadTemp"] | null;
  payment: ClientRecord["payment"] | null;
  service: string | null;
  value: number | null;
  monthly_value: number | null;
  partner_terms: string | null;
  freelancer_role: string | null;
  freelancer_rate: number | null;
  next_action: string | null;
  notes: string | null;
  created_at: string;
};

type ProjectRow = {
  id: string;
  workspace_id: string;
  client_id: string | null;
  title: string;
  preset_id: string | null;
  type: string | null;
  status: ProjectRecord["status"] | null;
  deadline: string | null;
  budget: number | null;
  link: string | null;
  pipeline: ProjectRecord["pipeline"];
  checklist: ProjectRecord["checklist"];
  deliverables: ProjectRecord["deliverables"];
  created_at: string;
};

type DocumentRow = {
  id: string;
  workspace_id: string;
  project_id: string | null;
  client_id: string | null;
  doc_type: StudioDocumentRecord["docType"];
  title: string;
  preset_id: string | null;
  payload: Record<string, string>;
  summary: string | null;
  created_at: string;
};

type FinanceRow = {
  id: string;
  workspace_id: string;
  label: string;
  type: FinanceEntry["type"];
  amount: number;
  status: FinanceEntry["status"];
  due_at: string;
  client_id: string | null;
  project_id: string | null;
};

export type CloudLoadResult = {
  workspaceId: string;
  state: WorkspaceState;
};

function mapBusinessProfile(row?: WorkspaceRow | null): BusinessProfile {
  const socialLinks = row?.social_links ?? {};

  return {
    name: row?.name || "DNZ Films",
    legalName: row?.legal_name ?? "DNZ Films Produções Audiovisuais",
    documentNumber: row?.document_number ?? "",
    logoUrl: row?.logo_url ?? "",
    address: row?.address ?? "",
    phone: row?.phone ?? "",
    email: row?.email ?? "elytraprod@gmail.com",
    siteUrl: row?.site_url ?? "https://dnzcentral.com.br",
    socialInstagram: socialLinks.instagram ?? "@dnzfilms",
    socialLinkedin: socialLinks.linkedin ?? "",
    socialYoutube: socialLinks.youtube ?? "",
    defaultSignature: row?.default_signature ?? "Equipe DNZ Films",
    bankInfo: row?.bank_info ?? "",
    fiscalInfo: row?.fiscal_info ?? "",
  };
}

function mapClient(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    company: row.company ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    role: row.role ?? undefined,
    leadSource: row.lead_source ?? undefined,
    referral: row.referral ?? undefined,
    acquisitionChannel: row.acquisition_channel ?? undefined,
    contactReason: row.contact_reason ?? undefined,
    desiredService: row.desired_service ?? undefined,
    estimatedBudget: row.estimated_budget ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    contactHistory: row.contact_history ?? [],
    relationshipType: row.relationship_type ?? "cliente",
    status: row.status ?? "lead",
    leadTemp: row.lead_temp ?? "morno",
    payment: row.payment ?? "pendente",
    service: row.service ?? "Vídeo Institucional",
    value: Number(row.value ?? row.monthly_value ?? 0),
    monthlyValue: row.monthly_value ?? undefined,
    partnerTerms: row.partner_terms ?? undefined,
    freelancerRole: row.freelancer_role ?? undefined,
    freelancerRate: row.freelancer_rate ?? undefined,
    nextAction: row.next_action ?? "Definir próxima ação",
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    clientId: row.client_id ?? "",
    title: row.title,
    presetId: row.preset_id ?? "institucional",
    type: row.type ?? "gravação",
    status: row.status ?? "briefing",
    deadline: row.deadline ?? "",
    budget: Number(row.budget ?? 0),
    link: row.link ?? undefined,
    pipeline: row.pipeline ?? {},
    checklist: row.checklist ?? [],
    deliverables: row.deliverables ?? [],
    createdAt: row.created_at,
  };
}

function mapDocument(row: DocumentRow): StudioDocumentRecord {
  return {
    id: row.id,
    docType: row.doc_type,
    title: row.title,
    clientId: row.client_id ?? undefined,
    projectId: row.project_id ?? undefined,
    presetId: row.preset_id ?? "institucional",
    payload: row.payload ?? {},
    summary: row.summary ?? "",
    createdAt: row.created_at,
  };
}

function mapFinance(row: FinanceRow): FinanceEntry {
  return {
    id: row.id,
    label: row.label,
    type: row.type,
    amount: Number(row.amount ?? 0),
    status: row.status,
    dueAt: row.due_at,
    clientId: row.client_id ?? undefined,
    projectId: row.project_id ?? undefined,
  };
}

export async function ensureWorkspace(supabase: SupabaseClient, user: User) {
  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<{ workspace_id: string; role: string }>();

  if (memberError) throw memberError;
  if (member?.workspace_id) return member.workspace_id;

  const name = user.user_metadata?.name || user.email?.split("@")[0] || "Studio";
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({ owner_id: user.id, name: `${name} OS`, plan: "starter" })
    .select("id")
    .single<{ id: string }>();

  if (workspaceError) throw workspaceError;

  const { error: insertMemberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });

  if (insertMemberError) throw insertMemberError;

  return workspace.id;
}

export async function loadWorkspaceState(supabase: SupabaseClient, workspaceId: string): Promise<WorkspaceState> {
  const [workspaceRes, clientsRes, projectsRes, documentsRes, financeRes] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id,name,legal_name,document_number,logo_url,address,phone,email,site_url,social_links,default_signature,bank_info,fiscal_info")
      .eq("id", workspaceId)
      .maybeSingle<WorkspaceRow>(),
    supabase.from("clients").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).returns<ClientRow[]>(),
    supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).returns<ProjectRow[]>(),
    supabase
      .from("document_generations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .returns<DocumentRow[]>(),
    supabase.from("finance_entries").select("*").eq("workspace_id", workspaceId).order("due_at", { ascending: true }).returns<FinanceRow[]>(),
  ]);

  const error = workspaceRes.error || clientsRes.error || projectsRes.error || documentsRes.error || financeRes.error;
  if (error) throw error;

  return {
    businessProfile: mapBusinessProfile(workspaceRes.data),
    clients: (clientsRes.data ?? []).map(mapClient),
    projects: (projectsRes.data ?? []).map(mapProject),
    documents: (documentsRes.data ?? []).map(mapDocument),
    financeEntries: (financeRes.data ?? []).map(mapFinance),
    privacyMode: false,
  };
}

export async function loadCloudWorkspace(supabase: SupabaseClient, user: User): Promise<CloudLoadResult> {
  const workspaceId = await ensureWorkspace(supabase, user);
  const state = await loadWorkspaceState(supabase, workspaceId);

  return { workspaceId, state };
}

export async function insertClient(supabase: SupabaseClient, workspaceId: string, client: ClientRecord) {
  const { error } = await supabase.from("clients").insert({
    id: client.id,
    workspace_id: workspaceId,
    name: client.name,
    email: client.email ?? null,
    phone: client.phone ?? null,
    whatsapp: client.whatsapp ?? null,
    company: client.company ?? null,
    role: client.role ?? null,
    lead_source: client.leadSource ?? null,
    referral: client.referral ?? null,
    acquisition_channel: client.acquisitionChannel ?? null,
    contact_reason: client.contactReason ?? null,
    desired_service: client.desiredService ?? null,
    estimated_budget: client.estimatedBudget ?? null,
    assigned_to: client.assignedTo ?? null,
    contact_history: client.contactHistory ?? [],
    relationship_type: client.relationshipType,
    status: client.status,
    lead_temp: client.leadTemp,
    payment: client.payment,
    service: client.service,
    value: client.value,
    monthly_value: client.monthlyValue ?? null,
    partner_terms: client.partnerTerms ?? null,
    freelancer_role: client.freelancerRole ?? null,
    freelancer_rate: client.freelancerRate ?? null,
    next_action: client.nextAction,
    notes: client.notes ?? null,
  });

  if (error) throw error;
}

export async function updateBusinessProfile(supabase: SupabaseClient, workspaceId: string, profile: BusinessProfile) {
  const { error } = await supabase
    .from("workspaces")
    .update({
      name: profile.name,
      legal_name: profile.legalName,
      document_number: profile.documentNumber || null,
      logo_url: profile.logoUrl || null,
      address: profile.address || null,
      phone: profile.phone || null,
      email: profile.email || null,
      site_url: profile.siteUrl || null,
      social_links: {
        instagram: profile.socialInstagram,
        linkedin: profile.socialLinkedin,
        youtube: profile.socialYoutube,
      },
      default_signature: profile.defaultSignature || null,
      bank_info: profile.bankInfo || null,
      fiscal_info: profile.fiscalInfo || null,
    })
    .eq("id", workspaceId);

  if (error) throw error;
}

export async function deleteClient(supabase: SupabaseClient, clientId: string) {
  const { error } = await supabase.from("clients").delete().eq("id", clientId);
  if (error) throw error;
}

export async function insertProject(supabase: SupabaseClient, workspaceId: string, project: ProjectRecord) {
  const { error } = await supabase.from("projects").insert({
    id: project.id,
    workspace_id: workspaceId,
    client_id: project.clientId || null,
    title: project.title,
    preset_id: project.presetId,
    type: project.type,
    status: project.status,
    deadline: project.deadline || null,
    budget: project.budget,
    link: project.link ?? null,
    pipeline: project.pipeline,
    checklist: project.checklist,
    deliverables: project.deliverables,
  });

  if (error) throw error;
}

export async function updateProjectPipeline(supabase: SupabaseClient, project: ProjectRecord) {
  const { error } = await supabase.from("projects").update({ pipeline: project.pipeline }).eq("id", project.id);
  if (error) throw error;
}

export async function updateProjectChecklist(supabase: SupabaseClient, project: ProjectRecord) {
  const { error } = await supabase.from("projects").update({ checklist: project.checklist }).eq("id", project.id);
  if (error) throw error;
}

export async function deleteProject(supabase: SupabaseClient, projectId: string) {
  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw error;
}

export async function insertDocument(supabase: SupabaseClient, workspaceId: string, document: StudioDocumentRecord) {
  const { error } = await supabase.from("document_generations").insert({
    id: document.id,
    workspace_id: workspaceId,
    project_id: document.projectId ?? null,
    client_id: document.clientId ?? null,
    doc_type: document.docType,
    title: document.title,
    preset_id: document.presetId,
    payload: document.payload,
    summary: document.summary,
  });

  if (error) throw error;
}
