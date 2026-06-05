"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { MemberStatus, UserRole } from "@/lib/auth/roles";
import { studioDocById, type PipelineKey, type RelationshipType, type StudioDocId, presetById } from "@/lib/constants";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  INITIAL_WORKSPACE_STATE,
  buildClient,
  buildDocumentSummary,
  buildProposal,
  buildProject,
  createId,
  getClientName,
  normalizeWorkspaceState,
  type BusinessProfile,
  type ClientRecord,
  type StudioDocumentRecord,
  type WorkspaceState,
} from "@/lib/workspace-state";
import { buildStudioDocumentHtml } from "@/lib/studio-document-html";
import {
  deleteClient,
  deleteProject,
  insertClient,
  insertDocument,
  insertProposal,
  insertProject,
  loadCloudWorkspace,
  updateBusinessProfile as updateCloudBusinessProfile,
  updateProjectChecklist,
  updateProjectPipeline,
  updateProposal,
  updateWorkspaceMemberRole as updateCloudWorkspaceMemberRole,
  updateWorkspaceMemberStatus as updateCloudWorkspaceMemberStatus,
  type WorkspaceMemberRecord,
} from "@/services/workspace-service";
import { logActivity } from "@/services/operations-service";

const STORAGE_KEY = "nexo-next-workspace-state";

type WorkspaceContextValue = ReturnType<typeof useWorkspaceStateModel>;

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStoredState() {
  if (typeof window === "undefined") return INITIAL_WORKSPACE_STATE;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeWorkspaceState(JSON.parse(saved) as Partial<WorkspaceState>) : INITIAL_WORKSPACE_STATE;
  } catch {
    return INITIAL_WORKSPACE_STATE;
  }
}

function useWorkspaceStateModel() {
  const [state, setState] = useState<WorkspaceState>(INITIAL_WORKSPACE_STATE);
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceRole, setWorkspaceRole] = useState<UserRole | null>(null);
  const [workspaceMemberStatus, setWorkspaceMemberStatus] = useState<MemberStatus | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMemberRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<"local" | "loading" | "cloud" | "error">("local");
  const [syncMessage, setSyncMessage] = useState("");
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const logWorkspaceActivity = useCallback(
    (input: Parameters<typeof logActivity>[1]) => {
      if (!supabase || !workspaceId) return;
      logActivity(supabase, input).catch((error) => {
        console.error(error);
      });
    },
    [supabase, workspaceId],
  );

  const hydrateCloud = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!supabase || !nextSession?.user) {
      setWorkspaceId(null);
      setWorkspaceRole(null);
      setWorkspaceMemberStatus(null);
      setWorkspaceMembers([]);
      setSyncStatus("local");
      setSyncMessage(supabase ? "Dados locais até entrar." : "Supabase não configurado.");
      setState(readStoredState());
      setReady(true);
      return;
    }

    setSyncStatus("loading");
    setSyncMessage("Sincronizando workspace...");

    try {
      const cloud = await loadCloudWorkspace(supabase, nextSession.user);
      setWorkspaceId(cloud.workspaceId);
      setWorkspaceRole(cloud.role);
      setWorkspaceMemberStatus(cloud.status);
      setWorkspaceMembers(cloud.members);
      setState(cloud.state);
      setSyncStatus("cloud");
      setSyncMessage("Workspace conectado ao Supabase.");
    } catch (error) {
      console.error(error);
      setWorkspaceId(null);
      setWorkspaceRole(null);
      setWorkspaceMemberStatus(null);
      setWorkspaceMembers([]);
      setState(readStoredState());
      setSyncStatus("error");
      setSyncMessage("Supabase conectado, mas o schema/RLS ainda precisa ser aplicado.");
    } finally {
      setReady(true);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setState(readStoredState());
      setSyncMessage("Supabase não configurado.");
      setReady(true);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      hydrateCloud(data.session);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      hydrateCloud(nextSession);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [hydrateCloud, supabase]);

  useEffect(() => {
    if (!ready || session) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, session, state]);

  const metrics = useMemo(() => {
    const receivable = state.financeEntries
      .filter((entry) => entry.type === "receivable" && entry.status !== "paid")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const received = state.financeEntries
      .filter((entry) => entry.type === "received" || entry.status === "paid")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const payable = state.financeEntries
      .filter((entry) => entry.type === "payable" && entry.status !== "paid")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const activeProjects = state.projects.filter((project) => project.status !== "entregue").length;
    const clientsToAnswer = state.clients.filter((client) => client.status === "lead").length;

    return {
      receivable,
      received,
      payable,
      expectedProfit: receivable + received - payable,
      activeProjects,
      clientsToAnswer,
      savedDocs: state.documents.length,
    };
  }, [state]);

  const actions = useMemo(
    () => ({
      addClient(
        input: {
          name: string;
          relationshipType: RelationshipType;
          presetId: string;
          playbookId?: string;
          nextAction?: string;
        } & Partial<ClientRecord>,
      ) {
        const client = buildClient(input);
        setState((current) => ({ ...current, clients: [client, ...current.clients] }));
        if (supabase && workspaceId) {
          insertClient(supabase, workspaceId, client).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível salvar cliente no Supabase.");
          });
          logWorkspaceActivity({
            action: "created",
            entityId: client.id,
            entityType: "client",
            metadata: { relationshipType: client.relationshipType, service: client.service },
            title: `Cliente criado: ${client.name}`,
            workspaceId,
          });
        }
        return client;
      },
      updateBusinessProfile(input: Partial<BusinessProfile>) {
        setState((current) => {
          const businessProfile = { ...current.businessProfile, ...input };
          if (supabase && workspaceId) {
            updateCloudBusinessProfile(supabase, workspaceId, businessProfile).catch((error) => {
              console.error(error);
              setSyncStatus("error");
              setSyncMessage("Não foi possível salvar configurações no Supabase.");
            });
          }
          return { ...current, businessProfile };
        });
      },
      removeClient(clientId: string) {
        setState((current) => ({
          ...current,
          clients: current.clients.filter((client) => client.id !== clientId),
          projects: current.projects.filter((project) => project.clientId !== clientId),
          financeEntries: current.financeEntries.filter((entry) => entry.clientId !== clientId),
        }));
        if (supabase && workspaceId) {
          deleteClient(supabase, clientId).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível excluir cliente no Supabase.");
          });
          logWorkspaceActivity({
            action: "deleted",
            entityId: clientId,
            entityType: "client",
            title: "Cliente excluído",
            workspaceId,
          });
        }
      },
      addProject(input: Parameters<typeof buildProject>[0]) {
        const project = buildProject(input);
        setState((current) => ({ ...current, projects: [project, ...current.projects] }));
        if (supabase && workspaceId) {
          insertProject(supabase, workspaceId, project).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível salvar projeto no Supabase.");
          });
          logWorkspaceActivity({
            action: "created",
            entityId: project.id,
            entityType: "project",
            metadata: { presetId: project.presetId, deadline: project.deadline, budget: project.budget },
            title: `Projeto criado: ${project.title}`,
            workspaceId,
          });
        }
        return project;
      },
      addProposal(input: Parameters<typeof buildProposal>[0]) {
        const proposal = buildProposal(input);
        setState((current) => ({ ...current, proposals: [proposal, ...current.proposals] }));
        if (supabase && workspaceId) {
          insertProposal(supabase, workspaceId, proposal).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível salvar proposta no Supabase.");
          });
          logWorkspaceActivity({
            action: "created",
            entityId: proposal.id,
            entityType: "finance",
            metadata: { amount: proposal.amount, status: proposal.status, clientId: proposal.clientId },
            title: `Proposta criada: ${proposal.title}`,
            workspaceId,
          });
        }
        return proposal;
      },
      convertProposalToProject(proposalId: string) {
        let createdProject: ReturnType<typeof buildProject> | undefined;
        let updatedProposal: ReturnType<typeof buildProposal> | undefined;

        setState((current) => {
          const proposal = current.proposals.find((item) => item.id === proposalId);
          if (!proposal) return current;

          createdProject = buildProject({
            clientId: proposal.clientId,
            presetId: proposal.presetId,
            title: proposal.title.replace(/^Proposta\s*-\s*/i, ""),
            briefing: proposal.scope,
            deadline: proposal.expectedCloseDate,
            deliveryDate: proposal.expectedCloseDate,
            budget: proposal.amount,
          });
          updatedProposal = {
            ...proposal,
            projectId: createdProject.id,
            status: "approved",
            updatedAt: new Date().toISOString(),
          };

          return {
            ...current,
            projects: [createdProject, ...current.projects],
            proposals: current.proposals.map((item) => (item.id === proposalId ? updatedProposal! : item)),
          };
        });

        if (supabase && workspaceId && createdProject && updatedProposal) {
          insertProject(supabase, workspaceId, createdProject).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível salvar projeto convertido.");
          });
          updateProposal(supabase, updatedProposal).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível atualizar proposta.");
          });
          logWorkspaceActivity({
            action: "converted",
            entityId: updatedProposal.id,
            entityType: "finance",
            metadata: { projectId: createdProject.id, amount: updatedProposal.amount },
            title: `Proposta convertida: ${updatedProposal.title}`,
            workspaceId,
          });
        }

        return createdProject;
      },
      removeProject(projectId: string) {
        setState((current) => ({
          ...current,
          projects: current.projects.filter((project) => project.id !== projectId),
          financeEntries: current.financeEntries.filter((entry) => entry.projectId !== projectId),
          documents: current.documents.filter((doc) => doc.projectId !== projectId),
        }));
        if (supabase && workspaceId) {
          deleteProject(supabase, projectId).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível excluir projeto no Supabase.");
          });
          logWorkspaceActivity({
            action: "deleted",
            entityId: projectId,
            entityType: "project",
            title: "Projeto excluído",
            workspaceId,
          });
        }
      },
      togglePipeline(projectId: string, key: PipelineKey) {
        setState((current) => {
          let updatedProject: WorkspaceState["projects"][number] | undefined;
          const projects = current.projects.map((project) => {
            if (project.id !== projectId) return project;
            updatedProject = { ...project, pipeline: { ...project.pipeline, [key]: !project.pipeline[key] } };
            return updatedProject;
          });

          if (supabase && workspaceId && updatedProject) {
            updateProjectPipeline(supabase, updatedProject).catch((error) => {
              console.error(error);
              setSyncStatus("error");
              setSyncMessage("Não foi possível sincronizar pipeline.");
            });
          }

          return { ...current, projects };
        });
      },
      toggleChecklist(projectId: string, index: number) {
        setState((current) => {
          let updatedProject: WorkspaceState["projects"][number] | undefined;
          const projects = current.projects.map((project) => {
            if (project.id !== projectId) return project;
            updatedProject = {
              ...project,
              checklist: project.checklist.map((item, itemIndex) => (itemIndex === index ? { ...item, done: !item.done } : item)),
            };
            return updatedProject;
          });

          if (supabase && workspaceId && updatedProject) {
            updateProjectChecklist(supabase, updatedProject).catch((error) => {
              console.error(error);
              setSyncStatus("error");
              setSyncMessage("Não foi possível sincronizar checklist.");
            });
          }

          return { ...current, projects };
        });
      },
      saveDocument(input: {
        docType: StudioDocId;
        clientId?: string;
        projectId?: string;
        presetId: string;
        payload: Record<string, string>;
      }) {
        const doc = studioDocById(input.docType);
        const preset = presetById(input.presetId);
        let record: StudioDocumentRecord | undefined;

        setState((current) => {
          const project = current.projects.find((item) => item.id === input.projectId);
          const clientName = getClientName(current, input.clientId || project?.clientId);
          const title = `${doc.label} - ${project?.title || preset.title}`;
          record = {
            id: createId("doc"),
            docType: input.docType,
            title,
            clientId: input.clientId || project?.clientId,
            projectId: input.projectId,
            presetId: input.presetId,
            payload: input.payload,
            summary: buildDocumentSummary({
              docLabel: doc.label,
              tone: `${doc.description}`,
              clientName,
              projectTitle: project?.title || preset.title,
              presetTitle: preset.title,
              payload: input.payload,
            }),
            html: buildStudioDocumentHtml({
              businessProfile: current.businessProfile,
              docLabel: doc.label,
              docColor: doc.color,
              title,
              subtitle: doc.description,
              clientName,
              projectTitle: project?.title || preset.title,
              presetTitle: preset.title,
              payload: input.payload,
            }),
            createdAt: new Date().toISOString(),
          };

          return { ...current, documents: [record, ...current.documents] };
        });

        if (!record) throw new Error("Não foi possível gerar o documento.");
        if (supabase && workspaceId) {
          insertDocument(supabase, workspaceId, record).catch((error) => {
            console.error(error);
            setSyncStatus("error");
            setSyncMessage("Não foi possível salvar documento no Supabase.");
          });
          logWorkspaceActivity({
            action: "generated",
            entityId: record.id,
            entityType: "document",
            metadata: { docType: record.docType, projectId: record.projectId, clientId: record.clientId },
            title: `Documento gerado: ${record.title}`,
            workspaceId,
          });
        }
        return record as StudioDocumentRecord;
      },
      togglePrivacy() {
        setState((current) => ({ ...current, privacyMode: !current.privacyMode }));
      },
      resetDemo() {
        setState(INITIAL_WORKSPACE_STATE);
      },
      async signInWithGithub() {
        if (!supabase) {
          setSyncStatus("error");
          setSyncMessage("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
          return;
        }

        const redirectTo = `${window.location.origin}/auth/callback`;
        setSyncStatus("loading");
        setSyncMessage("Abrindo login com GitHub...");

        const { error } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: { redirectTo },
        });

        if (error) {
          setSyncStatus("error");
          setSyncMessage(`GitHub não iniciou: ${error.message}`);
        }
      },
      async signOut() {
        await supabase?.auth.signOut();
        setSession(null);
        setUser(null);
        setWorkspaceId(null);
        setWorkspaceRole(null);
        setWorkspaceMemberStatus(null);
        setWorkspaceMembers([]);
        setSyncStatus("local");
        setSyncMessage("Sessão encerrada. Usando dados locais.");
        setState(readStoredState());
      },
      async updateWorkspaceMemberRole(memberId: string, role: UserRole) {
        if (!supabase || !workspaceId) return null;

        try {
          const member = await updateCloudWorkspaceMemberRole(supabase, memberId, role);
          setWorkspaceMembers((current) => current.map((item) => (item.id === member.id ? member : item)));
          return member;
        } catch (error) {
          console.error(error);
          setSyncStatus("error");
          setSyncMessage("Não foi possível alterar a permissão.");
          return null;
        }
      },
      async updateWorkspaceMemberStatus(memberId: string, status: MemberStatus) {
        if (!supabase || !workspaceId) return null;

        try {
          const member = await updateCloudWorkspaceMemberStatus(supabase, memberId, status);
          setWorkspaceMembers((current) => current.map((item) => (item.id === member.id ? member : item)));
          return member;
        } catch (error) {
          console.error(error);
          setSyncStatus("error");
          setSyncMessage("Não foi possível alterar o status do usuário.");
          return null;
        }
      },
    }),
    [logWorkspaceActivity, supabase, workspaceId],
  );

  return {
    state,
    ready,
    metrics,
    setState,
    session,
    user,
    workspaceId,
    workspaceRole,
    workspaceMemberStatus,
    workspaceMembers,
    supabaseConfigured: isSupabaseConfigured(),
    syncStatus,
    syncMessage,
    actions,
  };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const value = useWorkspaceStateModel();

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceState() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspaceState deve ser usado dentro de WorkspaceProvider.");

  return context;
}
