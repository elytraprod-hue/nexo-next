"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CheckSquare,
  Clapperboard,
  FileText,
  MessageSquareReply,
  Sparkles,
  UserRoundPlus,
  WandSparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AUDIOVISUAL_PRESETS, type RelationshipType } from "@/lib/constants";
import { addDaysInput } from "@/lib/workspace-state";
import { useWorkspaceState } from "@/hooks/use-workspace-state";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CommandAction = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  keywords: string;
  run: () => string;
};

function inferRelationship(query: string): RelationshipType {
  const normalized = query.toLowerCase();
  if (normalized.includes("freela") || normalized.includes("freelancer")) return "freelancer";
  if (normalized.includes("parceria") || normalized.includes("permuta")) return "parceria";
  if (normalized.includes("mensal") || normalized.includes("recorrente")) return "recorrente";
  return "cliente";
}

function inferPreset(query: string) {
  const normalized = query.toLowerCase();
  return (
    AUDIOVISUAL_PRESETS.find((preset) =>
      [preset.id, preset.label, preset.title, preset.service, preset.type].some((value) => normalized.includes(value.toLowerCase())),
    ) ?? AUDIOVISUAL_PRESETS[1]
  );
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { state, actions } = useWorkspaceState();
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpenChange, open]);

  const firstClient = state.clients[0];
  const firstProject = state.projects[0];

  const actionsList = useMemo<CommandAction[]>(
    () => [
      {
        id: "lead-clinica",
        label: "Lead de clínica + reel",
        description: "Cria cliente com playbook de estética, preset de reel e próxima ação.",
        icon: UserRoundPlus,
        color: "var(--green)",
        keywords: "cliente lead clinica estética reel",
        run: () => {
          actions.addClient({ name: "Clínica estética", relationshipType: "cliente", presetId: "reel", playbookId: "clinica" });
          return "Lead criado com playbook de clínica.";
        },
      },
      {
        id: "lead-imobiliario",
        label: "Lead imobiliário + drone",
        description: "Cria oportunidade com narrativa de imóvel, drone e próxima ação.",
        icon: WandSparkles,
        color: "var(--cyan)",
        keywords: "cliente lead imobiliaria corretor drone",
        run: () => {
          actions.addClient({ name: "Imobiliária / corretor", relationshipType: "cliente", presetId: "drone", playbookId: "imobiliario" });
          return "Lead imobiliário criado com preset de drone.";
        },
      },
      {
        id: "client-recurring",
        label: "Cliente recorrente mensal",
        description: "Cria uma conta recorrente com base em institucional.",
        icon: BriefcaseBusiness,
        color: "var(--blue)",
        keywords: "cliente recorrente mensal contrato",
        run: () => {
          actions.addClient({ name: "Cliente mensal", relationshipType: "recorrente", presetId: "institucional" });
          return "Cliente recorrente criado.";
        },
      },
      {
        id: "project-institutional",
        label: "Projeto institucional completo",
        description: "Cria projeto com pipeline, entregáveis e checklist automático.",
        icon: Clapperboard,
        color: "var(--violet)",
        keywords: "projeto institucional pipeline checklist",
        run: () => {
          if (!firstClient) return "Crie um cliente antes do projeto.";
          actions.addProject({
            clientId: firstClient.id,
            presetId: "institucional",
            title: "Vídeo institucional",
            deadline: addDaysInput(14),
          });
          return "Projeto institucional criado.";
        },
      },
      {
        id: "doc-briefing",
        label: "Gerar briefing do projeto atual",
        description: "Salva um briefing com base no primeiro projeto em andamento.",
        icon: FileText,
        color: "var(--cyan)",
        keywords: "briefing documento studio docs",
        run: () => {
          if (!firstProject) return "Crie um projeto antes do briefing.";
          actions.saveDocument({
            docType: "briefing",
            clientId: firstProject.clientId,
            projectId: firstProject.id,
            presetId: firstProject.presetId,
            payload: {
              "Objetivo estratégico": "Alinhar narrativa, público, formato e aprovação antes da produção.",
              "Critério de aprovação": "Cliente aprova objetivo, linguagem e entregáveis antes da captação.",
            },
          });
          return "Briefing salvo no histórico.";
        },
      },
      {
        id: "doc-checklist",
        label: "Gerar checklist de set",
        description: "Cria checklist premium para o projeto atual.",
        icon: CheckSquare,
        color: "#facc15",
        keywords: "checklist set camera audio luz",
        run: () => {
          if (!firstProject) return "Crie um projeto antes do checklist.";
          actions.saveDocument({
            docType: "checklist",
            clientId: firstProject.clientId,
            projectId: firstProject.id,
            presetId: firstProject.presetId,
            payload: {
              "Tipo de produção": firstProject.type,
              "Workflow de dados": "Backup 3-2-1, cartões conferidos e pasta de entrega criada.",
              "Pré-set": "Roteiro, bateria, cartão, áudio, luz, autorização e agenda conferidos.",
            },
          });
          return "Checklist salvo no histórico.";
        },
      },
      {
        id: "open-review",
        label: "Abrir review demo",
        description: "Vai para a tela de aprovação com comentários por timestamp.",
        icon: MessageSquareReply,
        color: "var(--orange)",
        keywords: "review aprovação video frame comentarios",
        run: () => {
          router.push("/review/demo");
          onOpenChange(false);
          return "Review aberto.";
        },
      },
    ],
    [actions, firstClient, firstProject, onOpenChange, router],
  );

  const filteredActions = actionsList.filter((action) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return `${action.label} ${action.description} ${action.keywords}`.toLowerCase().includes(normalized);
  });

  function runAction(action: CommandAction) {
    setFeedback(action.run());
  }

  function createFromText() {
    const text = query.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const preset = inferPreset(lower);

    if (lower.includes("projeto")) {
      const client = firstClient ?? actions.addClient({ name: "Cliente rápido", relationshipType: "cliente", presetId: preset.id });
      actions.addProject({
        clientId: client.id,
        presetId: preset.id,
        title: text.replace(/projeto/gi, "").trim() || preset.title,
        deadline: addDaysInput(14),
      });
      setFeedback("Projeto criado a partir do texto.");
      return;
    }

    const relationshipType = inferRelationship(lower);
    actions.addClient({ name: text, relationshipType, presetId: preset.id });
    setFeedback("Contato criado a partir do texto.");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/60 px-3 py-6 backdrop-blur-xl sm:px-6 sm:py-14" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" aria-label="Fechar comandos" onClick={() => onOpenChange(false)} />
      <section className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-[#101010]/95 shadow-2xl">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-orange-400/20 bg-orange-500/10 px-4 py-3">
            <Sparkles className="text-orange-400" size={20} />
            <input
              autoFocus
              className="min-h-10 flex-1 bg-transparent text-base font-black text-white outline-none placeholder:text-zinc-600"
              placeholder="Digite pouco: cliente clínica, projeto drone, briefing..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setFeedback("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") createFromText();
              }}
            />
            <Badge color="var(--orange)">⌘K</Badge>
          </div>
          {feedback ? <p className="mt-3 text-sm font-bold text-emerald-300">{feedback}</p> : null}
        </div>

        <div className="max-h-[66vh] overflow-auto p-3">
          {query.trim() ? (
            <button
              className="mb-3 flex w-full items-center gap-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-left transition hover:bg-cyan-300/15"
              type="button"
              onClick={createFromText}
            >
              <WandSparkles className="shrink-0 text-cyan-300" />
              <div>
                <p className="font-black">Criar a partir de: “{query.trim()}”</p>
                <p className="mt-1 text-sm text-zinc-500">Detecto cliente/projeto, tipo de relação e preset pelo texto.</p>
              </div>
            </button>
          ) : null}

          <div className="grid gap-2">
            {filteredActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.id}
                  className="flex w-full items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.08]"
                  type="button"
                  onClick={() => runAction(action)}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06]" style={{ color: action.color }}>
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block font-black text-white">{action.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-zinc-500">{action.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
