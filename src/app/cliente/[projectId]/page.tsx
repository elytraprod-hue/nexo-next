import { ClientProjectPage } from "@/features/client-portal/client-project-page";

type ClientProjectRouteProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ClientProjectRoute({ params }: ClientProjectRouteProps) {
  const { projectId } = await params;

  return <ClientProjectPage projectId={projectId} />;
}
