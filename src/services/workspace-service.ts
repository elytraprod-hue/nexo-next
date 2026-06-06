import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { MemberStatus, UserRole } from "@/lib/auth/roles";
import type { RelationshipType } from "@/lib/constants";
import type { BusinessProfile, ClientRecord, CommercialProposal, FinanceEntry, ProjectRecord, StudioDocumentRecord, WorkspaceState } from "@/lib/workspace-state";

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
  person_type: ClientRecord["personType"] | null;
  document_number: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  site_url: string | null;
  address: string | null;
  primary_contact: string | null;
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
  communication_history: string[] | null;
  file_links: string[] | null;
  tags: string[] | null;
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
  briefing: string | null;
  reference_links: string[] | null;
  shoot_date: string | null;
  deadline: string | null;
  delivery_date: string | null;
  budget: number | null;
  crew: string[] | null;
  priority: ProjectRecord["priority"] | null;
  link: string | null;
  links: string[] | null;
  pipeline: ProjectRecord["pipeline"];
  checklist: ProjectRecord["checklist"];
  deliverables: ProjectRecord["deliverables"];
  approvals: ProjectRecord["approvals"] | null;
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
  html: string | null;
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

type ProposalRow = {
  id: string;
  workspace_id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  preset_id: string;
  scope: string;
  amount: number;
  status: CommercialProposal["status"];
  valid_until: string;
  expected_close_date: string;
  loss_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

type WorkspaceMemberRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  email: string | null;
  role: UserRole | null;
  status: MemberStatus | null;
  created_at: string;
};

export type WorkspaceMemberRecord = {
  id: string;
  userId: string;
  email: string;
  role: UserRole;
  status: MemberStatus;
  createdAt: string;
};

export type CloudLoadResult = {
  members: WorkspaceMemberRecord[];
  role: UserRole;
  status: MemberStatus;
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
    personType: row.person_type ?? "empresa",
    company: row.company ?? undefined,
    documentNumber: row.document_number ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    instagram: row.instagram ?? undefined,
    siteUrl: row.site_url ?? undefined,
    address: row.address ?? undefined,
    primaryContact: row.primary_contact ?? row.name,
    role: row.role ?? undefined,
    leadSource: row.lead_source ?? undefined,
    referral: row.referral ?? undefined,
    acquisitionChannel: row.acquisition_channel ?? undefined,
    contactReason: row.contact_reason ?? undefined,
    desiredService: row.desired_service ?? undefined,
    estimatedBudget: row.estimated_budget ?? undefined,
    assignedTo: row.assigned_to ?? undefined,
    contactHistory: row.contact_history ?? [],
    communicationHistory: row.communication_history ?? row.contact_history ?? [],
    fileLinks: row.file_links ?? [],
    tags: row.tags ?? [],
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
    briefing: row.briefing ?? undefined,
    references: row.reference_links ?? [],
    shootDate: row.shoot_date ?? undefined,
    deadline: row.deadline ?? "",
    deliveryDate: row.delivery_date ?? row.deadline ?? "",
    budget: Number(row.budget ?? 0),
    crew: row.crew ?? [],
    priority: row.priority ?? "normal",
    link: row.link ?? undefined,
    links: row.links ?? (row.link ? [row.link] : []),
    pipeline: row.pipeline ?? {},
    checklist: row.checklist ?? [],
    deliverables: row.deliverables ?? [],
    approvals: row.approvals ?? [],
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
    html: row.html ?? undefined,
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

function mapProposal(row: ProposalRow): CommercialProposal {
  return {
    id: row.id,
    clientId: row.client_id,
    projectId: row.project_id ?? undefined,
    title: row.title,
    presetId: row.preset_id,
    scope: row.scope,
    amount: Number(row.amount ?? 0),
    status: row.status ?? "draft",
    validUntil: row.valid_until,
    expectedCloseDate: row.expected_close_date,
    lossReason: row.loss_reason ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

function mapWorkspaceMember(row: WorkspaceMemberRow): WorkspaceMemberRecord {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email ?? row.user_id,
    role: row.role ?? "member",
    status: row.status ?? "active",
    createdAt: row.created_at,
  };
}

export async function ensureWorkspace(supabase: SupabaseClient, user: User) {
  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, status, email")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<{ workspace_id: string; role: UserRole | null; status: MemberStatus | null; email: string | null }>();

  if (memberError) throw memberError;
  if (member?.workspace_id) {
    if (!member.email && user.email) {
      supabase
        .from("workspace_members")
        .update({ email: user.email })
        .eq("workspace_id", member.workspace_id)
        .eq("user_id", user.id)
        .then(() => undefined);
    }

    return {
      role: member.role ?? "member",
      status: member.status ?? "active",
      workspaceId: member.workspace_id,
    };
  }

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
    email: user.email ?? null,
    role: "owner",
    status: "active",
  });

  if (insertMemberError) throw insertMemberError;

  return { role: "owner" as UserRole, status: "active" as MemberStatus, workspaceId: workspace.id };
}

export async function loadWorkspaceState(supabase: SupabaseClient, workspaceId: string): Promise<WorkspaceState> {
  const [workspaceRes, clientsRes, projectsRes, proposalsRes, documentsRes, financeRes] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id,name,legal_name,document_number,logo_url,address,phone,email,site_url,social_links,default_signature,bank_info,fiscal_info")
      .eq("id", workspaceId)
      .maybeSingle<WorkspaceRow>(),
    supabase.from("clients").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).returns<ClientRow[]>(),
    supabase.from("projects").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).returns<ProjectRow[]>(),
    supabase
      .from("commercial_proposals")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .returns<ProposalRow[]>(),
    supabase
      .from("document_generations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .returns<DocumentRow[]>(),
    supabase.from("finance_entries").select("*").eq("workspace_id", workspaceId).order("due_at", { ascending: true }).returns<FinanceRow[]>(),
  ]);

  const error = workspaceRes.error || clientsRes.error || projectsRes.error || proposalsRes.error || documentsRes.error || financeRes.error;
  if (error) throw error;

  return {
    businessProfile: mapBusinessProfile(workspaceRes.data),
    clients: (clientsRes.data ?? []).map(mapClient),
    projects: (projectsRes.data ?? []).map(mapProject),
    proposals: (proposalsRes.data ?? []).map(mapProposal),
    documents: (documentsRes.data ?? []).map(mapDocument),
    financeEntries: (financeRes.data ?? []).map(mapFinance),
    privacyMode: false,
  };
}

export async function loadCloudWorkspace(supabase: SupabaseClient, user: User): Promise<CloudLoadResult> {
  const membership = await ensureWorkspace(supabase, user);
  const workspaceId = membership.workspaceId;
  const state = await loadWorkspaceState(supabase, workspaceId);
  const members = await loadWorkspaceMembers(supabase, workspaceId);

  return { members, role: membership.role, status: membership.status, workspaceId, state };
}

export async function loadWorkspaceMembers(supabase: SupabaseClient, workspaceId: string) {
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id,workspace_id,user_id,email,role,status,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
    .returns<WorkspaceMemberRow[]>();

  if (error) throw error;

  return (data ?? []).map(mapWorkspaceMember);
}

export async function updateWorkspaceMemberRole(supabase: SupabaseClient, memberId: string, role: UserRole) {
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)
    .select("id,workspace_id,user_id,email,role,status,created_at")
    .single<WorkspaceMemberRow>();

  if (error) throw error;

  return mapWorkspaceMember(data);
}

export async function updateWorkspaceMemberStatus(supabase: SupabaseClient, memberId: string, status: MemberStatus) {
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ status })
    .eq("id", memberId)
    .select("id,workspace_id,user_id,email,role,status,created_at")
    .single<WorkspaceMemberRow>();

  if (error) throw error;

  return mapWorkspaceMember(data);
}

export async function insertClient(supabase: SupabaseClient, workspaceId: string, client: ClientRecord) {
  const { error } = await supabase.from("clients").insert({
    id: client.id,
    workspace_id: workspaceId,
    name: client.name,
    person_type: client.personType,
    document_number: client.documentNumber ?? null,
    email: client.email ?? null,
    phone: client.phone ?? null,
    whatsapp: client.whatsapp ?? null,
    instagram: client.instagram ?? null,
    site_url: client.siteUrl ?? null,
    address: client.address ?? null,
    primary_contact: client.primaryContact ?? null,
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
    communication_history: client.communicationHistory ?? [],
    file_links: client.fileLinks ?? [],
    tags: client.tags ?? [],
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

export async function updateClientFileLinks(supabase: SupabaseClient, clientId: string, fileLinks: string[]) {
  const { error } = await supabase.from("clients").update({ file_links: fileLinks }).eq("id", clientId);
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
    briefing: project.briefing ?? null,
    reference_links: project.references ?? [],
    shoot_date: project.shootDate || null,
    deadline: project.deadline || null,
    delivery_date: project.deliveryDate || project.deadline || null,
    budget: project.budget,
    crew: project.crew ?? [],
    priority: project.priority,
    link: project.link ?? null,
    links: project.links ?? [],
    pipeline: project.pipeline,
    checklist: project.checklist,
    deliverables: project.deliverables,
    approvals: project.approvals ?? [],
  });

  if (error) throw error;
}

export async function insertProposal(supabase: SupabaseClient, workspaceId: string, proposal: CommercialProposal) {
  const { error } = await supabase.from("commercial_proposals").insert({
    id: proposal.id,
    workspace_id: workspaceId,
    client_id: proposal.clientId,
    project_id: proposal.projectId ?? null,
    title: proposal.title,
    preset_id: proposal.presetId,
    scope: proposal.scope,
    amount: proposal.amount,
    status: proposal.status,
    valid_until: proposal.validUntil,
    expected_close_date: proposal.expectedCloseDate,
    loss_reason: proposal.lossReason ?? null,
    notes: proposal.notes ?? null,
  });

  if (error) throw error;
}

export async function updateProposal(supabase: SupabaseClient, proposal: CommercialProposal) {
  const { error } = await supabase
    .from("commercial_proposals")
    .update({
      project_id: proposal.projectId ?? null,
      title: proposal.title,
      preset_id: proposal.presetId,
      scope: proposal.scope,
      amount: proposal.amount,
      status: proposal.status,
      valid_until: proposal.validUntil,
      expected_close_date: proposal.expectedCloseDate,
      loss_reason: proposal.lossReason ?? null,
      notes: proposal.notes ?? null,
    })
    .eq("id", proposal.id);

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
    html: document.html ?? null,
  });

  if (error) throw error;
}

export async function insertFinanceEntry(supabase: SupabaseClient, workspaceId: string, entry: FinanceEntry) {
  const { error } = await supabase.from("finance_entries").insert({
    id: entry.id,
    workspace_id: workspaceId,
    label: entry.label,
    type: entry.type,
    amount: entry.amount,
    status: entry.status,
    due_at: entry.dueAt,
    client_id: entry.clientId ?? null,
    project_id: entry.projectId ?? null,
  });

  if (error) throw error;
}
