import { ProtectedRoute } from "@/components/auth/protected-route";
import { ReviewWorkspace } from "@/features/video-review/review-workspace";

export default function ReviewWorkspaceRoute() {
  return (
    <ProtectedRoute>
      <ReviewWorkspace />
    </ProtectedRoute>
  );
}
