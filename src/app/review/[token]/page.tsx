import { ReviewPage } from "@/features/video-review/review-page";

type ReviewRouteProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicReviewRoute({ params }: ReviewRouteProps) {
  const { token } = await params;

  return <ReviewPage token={decodeURIComponent(token)} />;
}
