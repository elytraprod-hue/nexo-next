import { ProtectedRoute } from "@/components/auth/protected-route";
import { SettingsPage } from "@/features/settings/settings-page";

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}
