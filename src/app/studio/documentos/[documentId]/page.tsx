import { ProtectedRoute } from "@/components/auth/protected-route";
import { StudioDocumentPage } from "@/features/studio-docs/studio-document-page";

type StudioDocumentRouteProps = {
  params: Promise<{ documentId: string }>;
};

export default async function StudioDocumentRoute({ params }: StudioDocumentRouteProps) {
  const { documentId } = await params;

  return (
    <ProtectedRoute>
      <StudioDocumentPage documentId={decodeURIComponent(documentId)} />
    </ProtectedRoute>
  );
}
