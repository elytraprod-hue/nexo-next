"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, MessageSquareReply } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { PRODUCTION_PIPELINE } from "@/lib/constants";
import { getClientName } from "@/lib/workspace-state";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export function ClientProjectPage({ projectId }: { projectId: string }) {
  const { state } = useWorkspaceState();
  const project = state.projects.find((item) => item.id === projectId) ?? state.projects[0];
  const documents = state.documents.filter((document) => document.projectId === project?.id || document.clientId === project?.clientId);

  if (!project) {
    return (
      <main className="app-bg grid min-h-screen place-items-center p-4 text-zinc-100">
        <Surface className="max-w-lg text-center">
          <h1 className="text-2xl font-black">Projeto não encontrado</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-500">Peça um novo link para a produtora.</p>
        </Surface>
      </main>
    );
  }

  const done = PRODUCTION_PIPELINE.filter((step) => project.pipeline[step.key]).length;
  const progress = Math.round((done / PRODUCTION_PIPELINE.length) * 100);

  return (
    <main className="app-bg min-h-screen p-4 text-zinc-100 sm:p-6">
      <div className="mx-auto grid max-w-6xl gap-5">
        <Link className="inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-white" href="/">
          <ArrowLeft size={17} />
          Voltar
        </Link>

        <Surface className="border-orange-400/14 bg-orange-500/[0.035]">
          <Badge color="var(--orange)">Área do cliente</Badge>
          <h1 className="mt-4 text-4xl font-black leading-tight">{project.title}</h1>
          <p className="mt-3 text-sm font-bold text-zinc-500">{getClientName(state, project.clientId)} · entrega {formatDate(project.deliveryDate || project.deadline)}</p>
          <div className="mt-6 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-orange-400" style={{ width: `${progress}%` }} />
          </div>
        </Surface>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Surface>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-300" />
              <h2 className="text-xl font-black">Status da produção</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {PRODUCTION_PIPELINE.map((step) => (
                <div key={step.key} className={`rounded-xl border p-4 ${project.pipeline[step.key] ? "border-emerald-300/25 bg-emerald-300/10" : "border-white/10 bg-white/[0.035]"}`}>
                  <p className="text-sm font-black">{step.label}</p>
                  <p className="mt-2 text-xs font-bold text-zinc-500">{project.pipeline[step.key] ? "Concluído" : "Em andamento"}</p>
                </div>
              ))}
            </div>
          </Surface>

          <Surface>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Resumo</p>
            <p className="mt-3 text-3xl font-black text-emerald-300">{formatCurrency(project.budget, state.privacyMode)}</p>
            <p className="mt-2 text-sm text-zinc-500">Investimento do projeto</p>
            <Link className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-zinc-200 transition hover:bg-white/[0.1]" href="/review/demo">
              <MessageSquareReply size={17} />
              Abrir review
            </Link>
          </Surface>
        </section>

        <Surface>
          <div className="flex items-center gap-3">
            <FileText className="text-cyan-300" />
            <h2 className="text-xl font-black">Documentos</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {documents.length ? documents.map((document) => (
              <Link key={document.id} className="premium-card rounded-xl p-4 transition hover:bg-white/[0.055]" href={`/studio/documentos/${document.id}`}>
                <h3 className="font-black">{document.title}</h3>
                <p className="mt-2 text-sm text-zinc-500">{new Date(document.createdAt).toLocaleString("pt-BR")}</p>
              </Link>
            )) : (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">Nenhum documento liberado ainda.</div>
            )}
          </div>
        </Surface>
      </div>
    </main>
  );
}
