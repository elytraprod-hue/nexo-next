import { ProtectedRoute } from "@/components/auth/protected-route";
import { FinancePage } from "@/features/finance/finance-page";

export default function FinanceRoute() {
  return (
    <ProtectedRoute>
      <FinancePage />
    </ProtectedRoute>
  );
}
