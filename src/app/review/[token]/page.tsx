import { ReviewPage } from "@/features/video-review/review-page";

type ReviewRouteProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ video?: string; title?: string; source?: string }>;
};

export default async function PublicReviewRoute({ params, searchParams }: ReviewRouteProps) {
  const { token } = await params;
  const query = await searchParams;

  return (
    <ReviewPage
      initialTitle={query.title ? decodeURIComponent(query.title) : undefined}
      initialVideoSource={query.source === "drive" ? "drive" : "direct"}
      initialVideoUrl={query.video ? decodeURIComponent(query.video) : undefined}
      token={decodeURIComponent(token)}
    />
  );
}
