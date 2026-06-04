import { ProtectedRoute } from "@/components/auth/protected-route";
import { Dashboard } from "@/features/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
