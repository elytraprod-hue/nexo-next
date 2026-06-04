"use client";

import Link from "next/link";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { studioDocById } from "@/lib/constants";
import { buildStudioDocumentHtmlFromRecord } from "@/lib/studio-document-html";

export function StudioDocumentPage({ documentId }: { documentId: string }) {
  const { state } = useWorkspaceState();
  const record = state.documents.find((item) => item.id === documentId);

  if (!record) {
    return (
      <main className="app-bg min-h-screen px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl gap-5">
          <Link className="inline-flex w-fit items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white" href="/studio">
            <ArrowLeft size={18} />
            Voltar para documentos
          </Link>
          <Surface>
            <Badge color="var(--orange)">Documento</Badge>
            <h1 className="mt-4 text-3xl font-black">Documento não encontrado</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Ele pode estar salvo em outro workspace, ou o histórico local ainda não foi restaurado.</p>
          </Surface>
        </div>
      </main>
    );
  }

  const doc = studioDocById(record.docType);
  const html = buildStudioDocumentHtmlFromRecord(state, record);

  function exportPdf() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    window.setTimeout(() => printWindow.print(), 500);
  }

  return (
    <main className="app-bg min-h-screen px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link className="inline-flex w-fit items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white" href="/studio">
            <ArrowLeft size={18} />
            Voltar para Studio Docs
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-4 text-sm font-black text-cyan-200" href={`/studio?document=${record.id}`}>
              <RotateCcw size={17} />
              Restaurar no editor
            </Link>
            <Button onClick={exportPdf}>
              <Download size={17} />
              Exportar PDF
            </Button>
          </div>
        </header>

        <Surface>
          <Badge color={doc.color}>{doc.label}</Badge>
          <h1 className="mt-4 text-3xl font-black leading-tight">{record.title}</h1>
          <p className="mt-3 text-sm text-zinc-500">{new Date(record.createdAt).toLocaleString("pt-BR")}</p>

          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-black/35">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
              <span>Documento gerado</span>
              <span style={{ color: doc.color }}>{doc.label}</span>
            </div>
            <iframe className="h-[760px] w-full bg-[#f6f1e8]" title={record.title} srcDoc={html} />
          </div>
        </Surface>
      </div>
    </main>
  );
}
