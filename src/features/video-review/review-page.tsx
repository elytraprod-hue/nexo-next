"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Clock3, Film, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import { ReviewPlayer } from "@/features/video-review/review-player";
import { createPublicVideoComment, getPublicReviewByToken, normalizeReviewVideoUrl, updatePublicReviewStatus } from "@/services/review-service";
import type { ReviewDeliverable, ReviewStatus, VideoComment } from "@/types/review";

const fallbackDeliverable = (token: string, initialVideoUrl?: string, initialTitle?: string, initialVideoSource: "direct" | "hls" | "drive" = "direct"): ReviewDeliverable => ({
  id: "demo",
  title: initialTitle || (token === "demo" ? "Review demo NEXO" : "Review de vídeo"),
  version: 1,
  videoUrl: normalizeReviewVideoUrl(initialVideoUrl || (token === "demo" ? "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" : ""), initialVideoSource),
  videoSource: initialVideoSource,
  durationSeconds: token === "demo" ? 15 : undefined,
  reviewToken: token,
  status: "waiting_review",
  revisionRound: 1,
  comments: [
    {
      id: "demo-1",
      deliverableId: "demo",
      timestampSeconds: 12,
      timecode: "00:12",
      authorName: "Cliente",
      authorType: "client",
      content: "Exemplo de comentário preso no tempo do vídeo.",
      resolved: false,
      createdAt: new Date().toISOString(),
    },
  ],
});

type ReviewPageProps = {
  initialTitle?: string;
  initialVideoSource?: "direct" | "hls" | "drive";
  initialVideoUrl?: string;
  token: string;
};

export function ReviewPage({ initialTitle, initialVideoSource = "direct", initialVideoUrl, token }: ReviewPageProps) {
  const [deliverable, setDeliverable] = useState<ReviewDeliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadState, setLoadState] = useState<"ready" | "demo" | "not_found" | "expired" | "offline">("ready");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadState("ready");
      setNotice("");

      const loaded = await getPublicReviewByToken(token);
      if (!active) return;

      if (!loaded) {
        if (token === "demo" || initialVideoUrl) {
          setDeliverable(fallbackDeliverable(token, initialVideoUrl, initialTitle, initialVideoSource));
          setLoadState("demo");
          setNotice(token === "demo" ? "" : "Prévia local aberta com o vídeo informado no link.");
        } else {
          setDeliverable(null);
          setLoadState("not_found");
        }
        setLoading(false);
        return;
      }

      if (loaded.expiresAt && new Date(loaded.expiresAt).getTime() < Date.now()) {
        setDeliverable(null);
        setLoadState("expired");
        setLoading(false);
        return;
      }

      setDeliverable(loaded);
      setLoading(false);
    }

    load().catch(() => {
      if (!active) return;
      if (token === "demo" || initialVideoUrl) {
        setDeliverable(fallbackDeliverable(token, initialVideoUrl, initialTitle, initialVideoSource));
        setLoadState("demo");
        setNotice("Modo de prévia aberto enquanto a conexão é restabelecida.");
      } else {
        setDeliverable(null);
        setLoadState("offline");
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [initialTitle, initialVideoSource, initialVideoUrl, token]);

  const comments = useMemo(() => deliverable?.comments ?? [], [deliverable?.comments]);

  async function handleComment(comment: Omit<VideoComment, "id" | "createdAt" | "deliverableId" | "resolved">) {
    if (!deliverable) return;

    const optimistic: VideoComment = {
      ...comment,
      id: `local-${Date.now()}`,
      deliverableId: deliverable.id,
      resolved: false,
      createdAt: new Date().toISOString(),
    };

    setDeliverable((current) => (current ? { ...current, comments: [...(current.comments ?? []), optimistic] } : current));

    if (deliverable.id === "demo") return;

    const saved = await createPublicVideoComment({
      reviewToken: deliverable.reviewToken,
      timestampSeconds: comment.timestampSeconds,
      timecode: comment.timecode,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      content: comment.content,
    });

    setDeliverable((current) => {
      if (!current) return current;
      if (!saved) {
        return {
          ...current,
          comments: (current.comments ?? []).map((item) =>
            item.id === optimistic.id ? { ...item, content: `${item.content} (não sincronizado)` } : item,
          ),
        };
      }

      return {
        ...current,
        comments: (current.comments ?? []).map((item) => (item.id === optimistic.id ? saved : item)),
      };
    });
  }

  async function handleStatus(status: ReviewStatus) {
    if (!deliverable) return;
    setDeliverable({ ...deliverable, status });

    if (deliverable.id !== "demo") {
      await updatePublicReviewStatus(deliverable.reviewToken, status);
    }
  }

  return (
    <main className="app-bg min-h-screen px-3 py-4 text-zinc-100 sm:px-5 lg:px-6">
      <div className="mx-auto grid w-full max-w-[1500px] gap-4">
        <header className="sticky top-3 z-30 flex flex-col gap-3 rounded-[22px] border border-white/[0.075] bg-black/55 p-3 shadow-2xl backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-black text-zinc-400 transition hover:bg-white/[0.055] hover:text-white" href="/">
            <ArrowLeft size={18} />
            NEXO Review
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="var(--orange)">Link público</Badge>
            {deliverable ? <Badge color={deliverable.status === "approved" ? "var(--green)" : "var(--cyan)"}>{deliverable.title}</Badge> : null}
          </div>
        </header>

        {notice ? <div className="rounded-2xl border border-orange-400/25 bg-orange-400/10 px-4 py-3 text-sm font-bold text-orange-100">{notice}</div> : null}

        <Surface className="border-white/[0.06] bg-white/[0.022] p-2 sm:p-3">
          {loading ? (
            <div className="grid min-h-[520px] place-items-center text-center text-zinc-400">
              <div>
                <RefreshCw className="mx-auto animate-spin text-orange-300" size={34} />
                <p className="mt-4 text-sm font-black uppercase tracking-[0.18em]">Carregando review</p>
                <p className="mt-2 text-sm font-bold text-zinc-500">Abrindo vídeo, comentários e status de aprovação.</p>
              </div>
            </div>
          ) : deliverable ? (
            <ReviewPlayer deliverable={deliverable} comments={comments} onCreateComment={handleComment} onStatusChange={handleStatus} />
          ) : loadState === "expired" ? (
            <EmptyState
              description="Este link de aprovação passou do prazo definido pela produtora. Peça um novo link para continuar a revisão."
              icon={Clock3}
              label="Link expirado"
              title="A revisão não está mais disponível"
            />
          ) : loadState === "offline" ? (
            <EmptyState
              action={<Button onClick={() => window.location.reload()}>Tentar novamente</Button>}
              description="Não conseguimos acessar os dados deste review agora. A página pode ser recarregada sem perder o contexto do link."
              icon={AlertTriangle}
              label="Conexão"
              title="Não foi possível carregar o review"
            />
          ) : (
            <EmptyState
              description="Confira se o link foi copiado completo. Se o problema continuar, solicite um novo link de aprovação para a produtora."
              icon={Film}
              label="Review público"
              title="Link de review não encontrado"
            />
          )}
        </Surface>
      </div>
    </main>
  );
}
