"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, CirclePause, Clock3, Copy, GitBranch, Link2, Loader2, MessageSquare, Play, Send, ThumbsUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTimecode } from "@/lib/utils/timecode";
import type { ReviewDeliverable, ReviewStatus, VideoComment } from "@/types/review";

const statusMeta: Record<ReviewStatus, { label: string; color: string }> = {
  waiting_review: { label: "Aguardando cliente", color: "#eab308" },
  revision_requested: { label: "Revisão solicitada", color: "#f97316" },
  approved_with_changes: { label: "Aprovado com ajustes", color: "#3b82f6" },
  rejected: { label: "Precisa revisar", color: "#ef4444" },
  approved: { label: "Aprovado", color: "#10b981" },
};

type ReviewPlayerProps = {
  deliverable: ReviewDeliverable;
  comments: VideoComment[];
  onCreateComment: (comment: Omit<VideoComment, "id" | "createdAt" | "deliverableId" | "resolved">) => Promise<void>;
  onStatusChange: (status: ReviewStatus) => Promise<void>;
};

export function ReviewPlayer({ deliverable, comments, onCreateComment, onStatusChange }: ReviewPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(deliverable.durationSeconds ?? 0);
  const [currentTime, setCurrentTime] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState("");
  const [videoLoading, setVideoLoading] = useState(Boolean(deliverable.videoUrl));
  const [videoError, setVideoError] = useState("");

  const sortedComments = useMemo(
    () => [...comments].sort((a, b) => Number(a.timestampSeconds ?? 0) - Number(b.timestampSeconds ?? 0)),
    [comments],
  );
  const openComments = useMemo(() => sortedComments.filter((comment) => !comment.resolved), [sortedComments]);
  const resolvedComments = useMemo(() => sortedComments.filter((comment) => comment.resolved), [sortedComments]);
  const nearbyComments = useMemo(
    () => sortedComments.filter((comment) => Math.abs(Number(comment.timestampSeconds ?? 0) - currentTime) <= 4),
    [currentTime, sortedComments],
  );
  const publicUrl = deliverable.publicUrl || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    const savedName = localStorage.getItem("nexo_review_author_name");
    const savedEmail = localStorage.getItem("nexo_review_author_email");
    if (savedName) setAuthorName(savedName);
    if (savedEmail) setAuthorEmail(savedEmail);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !deliverable.videoUrl) return;

    let active = true;
    let hls: { destroy: () => void } | undefined;
    const isHls = deliverable.videoUrl.toLowerCase().includes(".m3u8");
    setVideoLoading(true);
    setVideoError("");

    if (isHls && !video.canPlayType("application/vnd.apple.mpegurl")) {
      import("hls.js")
        .then((mod) => {
          if (!active) return;
          const Hls = mod.default;
          if (!Hls.isSupported()) return;
          const instance = new Hls({ enableWorker: true, lowLatencyMode: false });
          instance.loadSource(deliverable.videoUrl);
          instance.attachMedia(video);
          hls = instance;
        })
        .catch(() => undefined);
    } else {
      video.src = deliverable.videoUrl;
    }

    return () => {
      active = false;
      hls?.destroy();
    };
  }, [deliverable.videoUrl]);

  function seekTo(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, seconds);
    video.pause();
    setIsPlaying(false);
    setCurrentTime(video.currentTime);
  }

  async function handleSubmit() {
    const video = videoRef.current;
    const seconds = Math.floor(video?.currentTime ?? currentTime ?? 0);
    const text = content.trim();
    if (!text) return;

    video?.pause();
    setSubmitting(true);
    setFormError("");

    try {
      const nextName = authorName.trim() || "Cliente";
      const nextEmail = authorEmail.trim();
      localStorage.setItem("nexo_review_author_name", nextName);
      localStorage.setItem("nexo_review_author_email", nextEmail);

      await onCreateComment({
        timestampSeconds: seconds,
        timecode: formatTimecode(seconds),
        authorName: nextName,
        authorEmail: nextEmail,
        authorType: "client",
        content: text,
      });

      setContent("");
    } catch {
      setFormError("Não foi possível enviar agora. Tente novamente em alguns segundos.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyPublicLink() {
    if (!publicUrl) return;
    await navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  const progress = duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <section className="review-grid grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.075] bg-black shadow-[0_28px_120px_rgba(0,0,0,0.52)]">
          {deliverable.videoUrl ? (
            <video
              ref={videoRef}
              className="aspect-video w-full bg-black"
              controls
              playsInline
              onCanPlay={() => {
                setVideoLoading(false);
                setVideoError("");
              }}
              onError={() => {
                setVideoLoading(false);
                setVideoError("Não foi possível carregar este vídeo. Confira se o link está público ou use upload real/CDN.");
              }}
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || deliverable.durationSeconds || 0)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onWaiting={() => setVideoLoading(true)}
            />
          ) : (
            <div className="grid aspect-video place-items-center bg-zinc-950 p-8 text-center">
              <div>
                <CirclePause className="mx-auto text-zinc-600" size={44} />
                <p className="mt-4 text-lg font-black">Vídeo aguardando URL</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  Quando o Supabase retornar um entregável com video_url, o player entra aqui com suporte a HLS.
                </p>
              </div>
            </div>
          )}
          {videoLoading && deliverable.videoUrl ? (
            <div className="absolute inset-0 grid place-items-center bg-black/55 text-center backdrop-blur-sm">
              <div>
                <Loader2 className="mx-auto animate-spin text-orange-300" size={34} />
                <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-zinc-200">Carregando vídeo</p>
                <p className="mt-2 text-xs font-bold text-zinc-400">Preparando player, timeline e marcadores.</p>
              </div>
            </div>
          ) : null}
        </div>
        {videoError ? (
          <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-sm font-bold leading-6 text-red-100">
            <AlertTriangle className="mb-2 text-red-300" size={18} />
            {videoError}
          </div>
        ) : null}

        <div className="premium-card rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3 text-sm font-bold text-zinc-400">
            <span>{formatTimecode(currentTime)}</span>
            <span>{formatTimecode(duration)}</span>
          </div>
          <div className="relative mt-3 h-8">
            <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/10" />
            <div className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-orange-500" style={{ width: `${progress}%` }} />
            {duration
              ? sortedComments.map((comment) => (
                  <button
                    key={comment.id}
                    aria-label={`Ir para comentário em ${comment.timecode}`}
                    className="focus-ring absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-cyan-300 shadow-[0_0_0_6px_rgba(34,211,238,0.16)]"
                    style={{ left: `${Math.min(100, Math.max(0, ((comment.timestampSeconds ?? 0) / duration) * 100))}%` }}
                    type="button"
                    onClick={() => seekTo(comment.timestampSeconds ?? 0)}
                  />
                ))
              : null}
            <input
              className="timeline-range absolute inset-0 h-8 w-full cursor-pointer"
              max={Math.max(duration, 1)}
              min={0}
              step={1}
              type="range"
              value={Math.min(currentTime, duration || currentTime)}
              onChange={(event) => seekTo(Number(event.target.value))}
            />
          </div>
          {sortedComments.length ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {sortedComments.map((comment) => (
                <button
                  key={`marker-${comment.id}`}
                  className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black transition ${
                    Math.abs(Number(comment.timestampSeconds ?? 0) - currentTime) <= 4
                      ? "border-cyan-300 bg-cyan-300/15 text-cyan-200"
                      : "border-white/10 bg-white/[0.045] text-zinc-400 hover:text-white"
                  }`}
                  type="button"
                  onClick={() => seekTo(comment.timestampSeconds ?? 0)}
                >
                  <Clock3 size={14} />
                  {comment.timecode}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="premium-card grid gap-3 rounded-2xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Comentar neste momento</p>
              <p className="mt-1 text-xl font-black text-orange-300">{formatTimecode(currentTime)}</p>
            </div>
            <div className="flex gap-2">
              <Button disabled={isPlaying || !deliverable.videoUrl} variant="ghost" onClick={() => videoRef.current?.play()}>
                <Play size={17} />
                Play
              </Button>
              <Button variant="ghost" onClick={() => videoRef.current?.pause()}>
                <CirclePause size={17} />
                Pausar
              </Button>
            </div>
          </div>
          {nearbyComments.length ? (
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Comentários deste trecho</p>
              <div className="mt-2 grid gap-2">
                {nearbyComments.slice(0, 3).map((comment) => (
                  <button key={`near-${comment.id}`} className="text-left text-sm font-bold leading-6 text-zinc-200" type="button" onClick={() => seekTo(comment.timestampSeconds ?? 0)}>
                    {comment.timecode} · {comment.content}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {formError ? <div className="rounded-lg border border-red-400/25 bg-red-400/10 p-3 text-sm font-bold text-red-200">{formError}</div> : null}
          <div className="grid gap-3 xl:grid-cols-[150px_180px_1fr_auto]">
            <input
              className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
              placeholder="Seu nome"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
            />
            <input
              className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
              placeholder="E-mail"
              type="email"
              value={authorEmail}
              onChange={(event) => setAuthorEmail(event.target.value)}
            />
            <input
              className="focus-ring min-h-11 rounded-lg border border-white/10 bg-black/25 px-4 text-sm font-bold text-white placeholder:text-zinc-600"
              placeholder="Escreva o ajuste aqui"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              onFocus={() => videoRef.current?.pause()}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
            />
            <Button disabled={submitting || !content.trim()} onClick={handleSubmit}>
              <Send size={17} />
              {submitting ? "Enviando" : "Enviar"}
            </Button>
          </div>
        </div>
      </div>

      <aside className="grid content-start gap-4">
        <div className="premium-card rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Entregável</p>
              <h1 className="mt-2 text-xl font-black leading-tight">{deliverable.title}</h1>
              <p className="mt-2 text-sm text-zinc-500">Versão {deliverable.version ?? 1} · Rodada {deliverable.revisionRound ?? 1}</p>
            </div>
            <Badge color={statusMeta[deliverable.status].color}>{statusMeta[deliverable.status].label}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-black">
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-zinc-400">
              Status<br />
              <span className="text-orange-300">{statusMeta[deliverable.status].label}</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-zinc-400">
              Versão<br />
              <span className="text-cyan-300">v{deliverable.version ?? 1}</span>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-zinc-400">
              Ajustes<br />
              <span className="text-emerald-300">{sortedComments.length}</span>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-white/[0.075] bg-black/20 p-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              <Link2 size={14} />
              Link público
            </div>
            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-zinc-300">{publicUrl}</p>
              <button className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.045] text-zinc-300" type="button" onClick={copyPublicLink} aria-label="Copiar link público">
                <Copy size={16} />
              </button>
            </div>
            {copied ? <p className="mt-2 text-xs font-black text-emerald-300">Link copiado.</p> : null}
          </div>
          <div className="mt-5 grid gap-2">
            <Button variant="success" onClick={() => onStatusChange("approved")}>
              <ThumbsUp size={17} />
              Aprovado
            </Button>
            <Button variant="ghost" onClick={() => onStatusChange("approved_with_changes")}>
              <Check size={17} />
              Aprovado com ajustes
            </Button>
            <Button variant="danger" onClick={() => onStatusChange("revision_requested")}>
              <X size={17} />
              Precisa revisar
            </Button>
          </div>
        </div>

        <div className="premium-card rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Comentários</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-zinc-300">{openComments.length} abertos</span>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
            <GitBranch className="mb-2 text-violet-300" size={16} />
            Threads por timestamp preparadas para respostas e resolução.
          </div>
          <div className="mt-4 grid max-h-[620px] gap-3 overflow-auto pr-1">
            {openComments.length ? (
              openComments.map((comment) => (
                <button
                  key={comment.id}
                  className="focus-ring rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  type="button"
                  onClick={() => seekTo(comment.timestampSeconds ?? 0)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-black text-cyan-300">
                      <MessageSquare size={16} />
                      {comment.timecode}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">{comment.authorName}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-200">{comment.content}</p>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm leading-6 text-zinc-500">
                Nenhum comentário aberto. Pause o vídeo no ponto certo e envie o primeiro ajuste.
              </div>
            )}
            {resolvedComments.length ? (
              <details className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <summary className="cursor-pointer text-sm font-black text-zinc-400">{resolvedComments.length} resolvido(s)</summary>
                <div className="mt-3 grid gap-2">
                  {resolvedComments.map((comment) => (
                    <button key={`resolved-${comment.id}`} className="rounded-lg border border-white/10 bg-black/20 p-3 text-left opacity-70" type="button" onClick={() => seekTo(comment.timestampSeconds ?? 0)}>
                      <p className="text-xs font-black text-cyan-300">{comment.timecode}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-300">{comment.content}</p>
                    </button>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}
