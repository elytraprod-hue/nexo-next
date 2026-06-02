"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { studioDocById, type PipelineKey, type RelationshipType, type StudioDocId, presetById } from "@/lib/constants";
import {
  INITIAL_WORKSPACE_STATE,
  buildClient,
  buildDocumentSummary,
  buildProject,
  createId,
  getClientName,
  type StudioDocumentRecord,
  type WorkspaceState,
} from "@/lib/workspace-state";

const STORAGE_KEY = "nexo-next-workspace-state";

type WorkspaceContextValue = ReturnType<typeof useWorkspaceStateModel>;

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readStoredState() {
  if (typeof window === "undefined") return INITIAL_WORKSPACE_STATE;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as WorkspaceState) : INITIAL_WORKSPACE_STATE;
  } catch {
    return INITIAL_WORKSPACE_STATE;
  }
}

function useWorkspaceStateModel() {
  const [state, setState] = useState<WorkspaceState>(INITIAL_WORKSPACE_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(readStoredState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

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
      addClient(input: { name: string; relationshipType: RelationshipType; presetId: string; playbookId?: string }) {
        const client = buildClient(input);
        setState((current) => ({ ...current, clients: [client, ...current.clients] }));
        return client;
      },
      removeClient(clientId: string) {
        setState((current) => ({
          ...current,
          clients: current.clients.filter((client) => client.id !== clientId),
          projects: current.projects.filter((project) => project.clientId !== clientId),
          financeEntries: current.financeEntries.filter((entry) => entry.clientId !== clientId),
        }));
      },
      addProject(input: { clientId: string; presetId: string; title?: string; deadline?: string; budget?: number }) {
        const project = buildProject(input);
        setState((current) => ({ ...current, projects: [project, ...current.projects] }));
        return project;
      },
      removeProject(projectId: string) {
        setState((current) => ({
          ...current,
          projects: current.projects.filter((project) => project.id !== projectId),
          financeEntries: current.financeEntries.filter((entry) => entry.projectId !== projectId),
          documents: current.documents.filter((doc) => doc.projectId !== projectId),
        }));
      },
      togglePipeline(projectId: string, key: PipelineKey) {
        setState((current) => ({
          ...current,
          projects: current.projects.map((project) =>
            project.id === projectId ? { ...project, pipeline: { ...project.pipeline, [key]: !project.pipeline[key] } } : project,
          ),
        }));
      },
      toggleChecklist(projectId: string, index: number) {
        setState((current) => ({
          ...current,
          projects: current.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  checklist: project.checklist.map((item, itemIndex) => (itemIndex === index ? { ...item, done: !item.done } : item)),
                }
              : project,
          ),
        }));
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
            createdAt: new Date().toISOString(),
          };

          return { ...current, documents: [record, ...current.documents] };
        });

        if (!record) throw new Error("Não foi possível gerar o documento.");
        return record as StudioDocumentRecord;
      },
      togglePrivacy() {
        setState((current) => ({ ...current, privacyMode: !current.privacyMode }));
      },
      resetDemo() {
        setState(INITIAL_WORKSPACE_STATE);
      },
    }),
    [],
  );

  return {
    state,
    ready,
    metrics,
    setState,
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
