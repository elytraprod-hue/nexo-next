import { ProtectedRoute } from "@/components/auth/protected-route";
import { ProjectsPage } from "@/features/projects/projects-page";

export default function ProjectsRoute() {
  return (
    <ProtectedRoute>
      <ProjectsPage />
    </ProtectedRoute>
  );
}
