import { ProtectedRoute } from "@/components/auth/protected-route";
import { StudioDocsPage } from "@/features/studio-docs/studio-docs-page";

export default function StudioRoute() {
  return (
    <ProtectedRoute>
      <StudioDocsPage />
    </ProtectedRoute>
  );
}
