import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminPage } from "@/features/admin/admin-page";

export default function AdminRoute() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminPage />
    </ProtectedRoute>
  );
}
