import { ModulePage } from "@/features/dashboard/module-page";

export default function ProjetosPage() {
  return (
    <ModulePage
      accent="var(--violet)"
      actions={["Novo projeto por preset", "Gerar cronograma", "Abrir checklist"]}
      checklist={[
        "Preset audiovisual cria entregáveis",
        "Etapas com status e documento vinculado",
        "Histórico de gerações por projeto",
        "Aprovação de vídeo conectada à entrega",
      ]}
      description="Briefing, roteiro, decupagem, callsheet, checklist e entrega em uma linha clara de produção."
      eyebrow="Produção"
      title="Pipeline visual por projeto"
    />
  );
}
