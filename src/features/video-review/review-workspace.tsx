"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, Film, Link2, Loader2, UploadCloud } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import { createReviewDeliverable, createReviewToken, inferReviewVideoSource, normalizeReviewVideoUrl, uploadReviewVideoFile } from "@/services/review-service";

type SourceMode = "url" | "drive" | "upload";

export function ReviewWorkspace() {
  const { state, workspaceId, syncStatus, user, supabaseConfigured, actions } = useWorkspaceState();
  const [mode, setMode] = useState<SourceMode>("upload");
  const [title, setTitle] = useState("Primeiro corte");
  const [videoUrl, setVideoUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [token, setToken] = useState("demo");
  const [copied, setCopied] = useState(false);
  const [createdReviewUrl, setCreatedReviewUrl] = useState("");
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const canCreateRealReview = Boolean(user && workspaceId && syncStatus === "cloud");

  const sourceUrl = mode === "drive" ? driveUrl : videoUrl;
  const normalizedSourceUrl = normalizeReviewVideoUrl(sourceUrl, mode === "drive" ? "drive" : inferReviewVideoSource(sourceUrl));
  const previewReviewUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (title.trim()) params.set("title", title.trim());
    if (normalizedSourceUrl.trim()) params.set("video", normalizedSourceUrl.trim());
    if (mode === "drive") params.set("source", "drive");
    return `/review/${encodeURIComponent(token)}${params.toString() ? `?${params.toString()}` : ""}`;
  }, [mode, normalizedSourceUrl, title, token]);
  const reviewUrl = createdReviewUrl || previewReviewUrl;

  async function copyLink() {
    const absolute = `${window.location.origin}${reviewUrl}`;
    await navigator.clipboard?.writeText(absolute);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function generateToken() {
    setToken(createReviewToken());
    setCreatedReviewUrl("");
    setCopied(false);
  }

  async function createRealReview() {
    setErrorText("");
    setStatusText("");
    setUploadProgress(0);

    if (!supabaseConfigured) {
      setErrorText("Supabase não está configurado neste ambiente.");
      return;
    }

    if (!canCreateRealReview || !workspaceId) {
      setErrorText("Entre com GitHub para salvar upload, link público e comentários no Supabase.");
      return;
    }

    const nextToken = token === "demo" ? createReviewToken() : token;
    const publicUrl = `${window.location.origin}/review/${encodeURIComponent(nextToken)}`;
    let finalVideoUrl = normalizedSourceUrl;
    let finalSource = inferReviewVideoSource(finalVideoUrl, mode === "drive" ? "drive" : "direct");

    if (mode === "upload") {
      if (!file) {
        setErrorText("Selecione um arquivo de vídeo antes de criar o review.");
        return;
      }
      finalSource = "direct";
    } else if (!finalVideoUrl) {
      setErrorText("Informe um link de vídeo ou Drive antes de criar o review.");
      return;
    }

    setBusy(true);
    setUploadProgress(12);

    try {
      if (mode === "upload" && file) {
        setStatusText(`Enviando ${file.name} para o Supabase Storage...`);
        setUploadProgress(38);
        const upload = await uploadReviewVideoFile({ file, reviewToken: nextToken, workspaceId });
        finalVideoUrl = upload.videoUrl;
        setUploadProgress(68);
      }

      setStatusText("Criando link público, status de aprovação e área de comentários...");
      setUploadProgress(84);
      const deliverable = await createReviewDeliverable({
        publicUrl,
        reviewToken: nextToken,
        title,
        videoSource: finalSource,
        videoUrl: finalVideoUrl,
        workspaceId,
      });

      const finalReviewUrl = `/review/${encodeURIComponent(deliverable.reviewToken)}`;
      setToken(deliverable.reviewToken);
      setCreatedReviewUrl(finalReviewUrl);
      setStatusText("Pronto. O cliente já pode assistir, comentar no tempo certo e aprovar pelo link público.");
      setUploadProgress(100);
    } catch (error) {
      console.error(error);
      setErrorText(error instanceof Error ? error.message : "Não foi possível criar o review agora.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell
      eyebrow="Review profissional"
      primaryAction={{ href: "/review/demo", label: "Abrir demo" }}
      subtitle="Crie um link de aprovação, envie para o cliente e concentre comentários por timestamp."
      title="Review"
    >
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Surface className="border-orange-400/12 bg-orange-500/[0.035]">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <Badge color={canCreateRealReview ? "var(--green)" : "var(--orange)"}>
                {canCreateRealReview ? "Storage conectado" : "Login necessário"}
              </Badge>
              <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight">Review profissional começa pelo vídeo.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Suba o arquivo, gere um link público e deixe o cliente comentar no segundo exato sem entrar no painel interno.</p>
            </div>
            <div className="grid content-start gap-2">
              {!user ? (
                <Button variant="ghost" onClick={actions.signInWithGithub}>
                  Entrar GitHub
                </Button>
              ) : null}
              <Button variant="ghost" onClick={generateToken}>
                <Link2 size={17} />
                Novo token
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: "upload", label: "Upload real", text: "Mais claro para cliente e equipe.", icon: UploadCloud },
              { id: "url", label: "URL / CDN", text: "MP4, HLS ou link público.", icon: Link2 },
              { id: "drive", label: "Google Drive", text: "Precisa estar público.", icon: Film },
            ].map((item) => {
              const Icon = item.icon;
              const active = mode === item.id;
              return (
                <button
                  key={item.id}
                  className={`focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-black transition ${
                    active ? "border-orange-400 bg-orange-500/15 text-orange-100" : "border-white/10 bg-white/[0.045] text-zinc-400 hover:text-white"
                  }`}
                  type="button"
                  onClick={() => setMode(item.id as SourceMode)}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/[0.075] bg-black/22 p-4">
            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Nome do entregável
                <input
                  className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                  placeholder="Ex: Corte V1 - campanha de verão"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              {mode === "url" ? (
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Link do vídeo
                  <input
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                    placeholder="https://cdn.exemplo.com/video.mp4 ou .m3u8"
                    value={videoUrl}
                    onChange={(event) => setVideoUrl(event.target.value)}
                  />
                </label>
              ) : null}

              {mode === "drive" ? (
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Link do Drive
                  <input
                    className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
                    placeholder="Cole o link compartilhável do Google Drive"
                    value={driveUrl}
                    onChange={(event) => setDriveUrl(event.target.value)}
                  />
                </label>
              ) : null}

              {mode === "upload" ? (
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                  Arquivo de vídeo
                  <span className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-orange-400/35 bg-orange-500/10 px-6 text-center text-sm font-bold normal-case tracking-normal text-orange-100 transition hover:bg-orange-500/15">
                    <UploadCloud size={34} />
                    <span className="text-base">{fileName || "Selecionar vídeo"}</span>
                    <span className="max-w-md text-xs leading-5 text-orange-200/70">MP4, MOV ou arquivo de vídeo. Depois de criado, o cliente recebe um link público de aprovação.</span>
                    <input
                      className="sr-only"
                      type="file"
                      accept="video/*"
                      onChange={(event) => {
                        const nextFile = event.target.files?.[0] ?? null;
                        setFile(nextFile);
                        setFileName(nextFile?.name ?? "");
                        setCreatedReviewUrl("");
                      }}
                    />
                  </span>
                </label>
              ) : null}
            </div>

            {mode === "upload" ? (
              <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
                O arquivo é salvo no bucket <strong>review-videos</strong>. Para vídeos pesados e escala de mercado, o próximo salto é trocar essa origem por Mux, Bunny Stream ou Cloudflare Stream com HLS/adaptive bitrate.
              </div>
            ) : null}
            {mode === "drive" && driveUrl ? (
              <div className="mt-4 rounded-lg border border-orange-300/20 bg-orange-300/10 p-4 text-sm leading-6 text-orange-100">
                Drive convertido para reprodução: <span className="break-all font-bold">{normalizedSourceUrl}</span>. Se o arquivo não estiver público, o player não consegue carregar.
              </div>
            ) : null}

            {errorText ? <div className="mt-4 rounded-lg border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold text-red-200">{errorText}</div> : null}
            {busy || statusText ? (
              <div className="mt-4 rounded-lg border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm font-bold text-emerald-200">
                <div className="flex items-center gap-3">
                  {busy ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  <span>{statusText || "Preparando review..."}</span>
                </div>
                {uploadProgress ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 rounded-xl border border-emerald-300/16 bg-emerald-300/[0.055] p-4 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                {createdReviewUrl ? "Link público real" : "Prévia de link"}
              </p>
              <p className="mt-2 truncate text-sm font-bold text-zinc-200">{reviewUrl}</p>
            </div>
            <Button variant="ghost" onClick={copyLink}>
              <Copy size={17} />
              {copied ? "Copiado" : "Copiar"}
            </Button>
            <Button disabled={busy} onClick={createRealReview}>
              {busy ? <Loader2 className="animate-spin" size={17} /> : <UploadCloud size={17} />}
              {busy ? "Processando" : "Criar link"}
            </Button>
            <Link className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black transition ${busy ? "pointer-events-none bg-zinc-700 text-zinc-400" : "bg-orange-500 text-black hover:bg-orange-400"}`} href={reviewUrl}>
              Abrir review
              <ArrowRight size={17} />
            </Link>
          </div>
        </Surface>

        <Surface className="bg-white/[0.025]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-300" />
            <h2 className="text-lg font-black">Maturidade do Review</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ["Ativo", "Upload, link público, comentários com timestamp e status de aprovação."],
              ["Evolução", "Versões V1/V2, progresso detalhado e HLS/adaptive bitrate."],
              ["Escala", "Portal do cliente, threads, resolução e histórico formal."],
            ].map(([titleItem, text]) => (
              <div key={titleItem} className="premium-card rounded-lg p-4">
                <p className="text-sm font-black text-white">{titleItem}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Workspace</p>
            <p className="mt-2 text-sm font-bold text-zinc-300">{state.businessProfile.name}</p>
            <p className="mt-1 text-xs font-bold text-zinc-500">{canCreateRealReview ? "Pronto para salvar reviews reais." : "Entre com GitHub para persistir upload e comentários."}</p>
          </div>
        </Surface>
      </section>
    </AppShell>
  );
}
