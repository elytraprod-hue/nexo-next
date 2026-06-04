import { ProtectedRoute } from "@/components/auth/protected-route";
import { ClientsPage } from "@/features/clients/clients-page";

export default function ClientesPage() {
  return (
    <ProtectedRoute>
      <ClientsPage />
    </ProtectedRoute>
  );
}
