import { ModulePage } from "@/features/dashboard/module-page";

export default function FinanceiroPage() {
  return (
    <ModulePage
      accent="#facc15"
      actions={["Novo lançamento", "Ocultar valores", "Ver contratos"]}
      checklist={[
        "Valores formatados e responsivos",
        "Pipeline ponderado por cliente",
        "Recorrências mensais",
        "Pendências por contrato e entrega",
      ]}
      description="Cards preparados para valores longos, alternância de privacidade e leitura clara de contas a receber."
      eyebrow="Financeiro"
      title="Recebimentos sem vazamento visual"
    />
  );
}
