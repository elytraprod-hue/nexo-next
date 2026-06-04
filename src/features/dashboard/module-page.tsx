import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";

type ModulePageProps = {
  accent: string;
  eyebrow: string;
  title: string;
  description: string;
  actions: string[];
  checklist: string[];
};

export function ModulePage({ accent, eyebrow, title, description, actions, checklist }: ModulePageProps) {
  return (
    <main className="app-bg min-h-screen px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5">
        <Link className="inline-flex w-fit items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white" href="/">
          <ArrowLeft size={18} />
          Voltar ao dashboard
        </Link>

        <Surface>
          <Badge color={accent}>{eyebrow}</Badge>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">{description}</p>
            </div>
            <div className="grid gap-3">
              {actions.map((action) => (
                <button
                  key={action}
                  className="focus-ring min-h-11 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-left text-sm font-black text-zinc-100 transition hover:bg-white/[0.1]"
                  type="button"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </Surface>

        <section className="grid gap-4 md:grid-cols-2">
          {checklist.map((item) => (
            <div key={item} className="soft-panel flex min-h-24 items-start gap-4 rounded-xl p-4">
              <CheckCircle2 className="mt-1 shrink-0" style={{ color: accent }} />
              <p className="text-sm leading-6 text-zinc-300">{item}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
