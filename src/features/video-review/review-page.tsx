"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import { ReviewPlayer } from "@/features/video-review/review-player";
import { createVideoComment, getCommentsByDeliverable, getDeliverableByToken, updateDeliverableStatus } from "@/services/review-service";
import type { ReviewDeliverable, ReviewStatus, VideoComment } from "@/types/review";

const fallbackDeliverable = (token: string): ReviewDeliverable => ({
  id: "demo",
  title: "Review de vídeo",
  version: 1,
  videoUrl: "",
  videoSource: "direct",
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
  token: string;
};

export function ReviewPage({ token }: ReviewPageProps) {
  const [deliverable, setDeliverable] = useState<ReviewDeliverable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const loaded = await getDeliverableByToken(token);
      if (!active) return;

      if (!loaded) {
        setDeliverable(fallbackDeliverable(token));
        setError("Supabase ainda não retornou esse token. Mantive uma tela de review funcional para teste local.");
        setLoading(false);
        return;
      }

      const comments = await getCommentsByDeliverable(loaded.id);
      if (!active) return;

      setDeliverable({ ...loaded, comments });
      setLoading(false);
    }

    load().catch(() => {
      if (!active) return;
      setDeliverable(fallbackDeliverable(token));
      setError("Não foi possível carregar o review agora.");
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [token]);

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

    const saved = await createVideoComment({
      deliverableId: deliverable.id,
      timestampSeconds: comment.timestampSeconds,
      timecode: comment.timecode,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      authorType: comment.authorType,
      content: comment.content,
    });

    if (saved) {
      setDeliverable((current) =>
        current
          ? {
              ...current,
              comments: (current.comments ?? []).map((item) => (item.id === optimistic.id ? saved : item)),
            }
          : current,
      );
    }
  }

  async function handleStatus(status: ReviewStatus) {
    if (!deliverable) return;
    setDeliverable({ ...deliverable, status });

    if (deliverable.id !== "demo") {
      await updateDeliverableStatus(deliverable.id, status);
    }
  }

  return (
    <main className="app-bg min-h-screen px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white" href="/">
            <ArrowLeft size={18} />
            Voltar ao NEXO
          </Link>
          <Badge color="var(--orange)">Review público</Badge>
        </header>

        {error ? <div className="rounded-2xl border border-orange-400/25 bg-orange-400/10 px-4 py-3 text-sm text-orange-100">{error}</div> : null}

        <Surface className="p-3 sm:p-4">
          {loading || !deliverable ? (
            <div className="grid min-h-[520px] place-items-center text-zinc-400">Carregando review...</div>
          ) : (
            <ReviewPlayer deliverable={deliverable} comments={comments} onCreateComment={handleComment} onStatusChange={handleStatus} />
          )}
        </Surface>
      </div>
    </main>
  );
}
