import { ModulePage } from "@/features/dashboard/module-page";

export default function ClientesPage() {
  return (
    <ModulePage
      accent="var(--green)"
      actions={["Novo cliente guiado", "Importar contato", "Criar proposta"]}
      checklist={[
        "Cliente pontual ou recorrente",
        "Parcerias e permutas com termos claros",
        "Freelancers com função, diária e disponibilidade",
        "Próxima ação comercial sempre visível",
      ]}
      description="Cadastro orientado por presets, relação comercial, recorrência, parceria, permuta e freelancers."
      eyebrow="Nexus comercial"
      title="Clientes com menos digitação"
    />
  );
}
