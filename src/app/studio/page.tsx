import { ModulePage } from "@/features/dashboard/module-page";
import { STUDIO_DOCUMENTS } from "@/lib/constants";

export default function StudioPage() {
  return (
    <ModulePage
      accent="var(--cyan)"
      actions={STUDIO_DOCUMENTS.slice(0, 4).map((doc) => doc.label)}
      checklist={STUDIO_DOCUMENTS.map((doc) => `${doc.label}: ${doc.description}`)}
      description="Cada documento tem campos próprios: briefing, roteiro, callsheet, decupagem, orçamento, cronograma, checklist e entrega."
      eyebrow="Studio Docs"
      title="Documentos únicos por formato"
    />
  );
}
