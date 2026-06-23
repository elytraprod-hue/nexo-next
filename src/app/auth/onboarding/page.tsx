"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, CheckCircle2, Film } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "creating" | "done" | "error">("checking");
  const [message, setMessage] = useState("Verificando sua conta...");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase não configurado. Verifique as variáveis de ambiente.");
      return;
    }

    async function setupWorkspace() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          setStatus("error");
          setMessage("Sessão não encontrada. Faça login novamente.");
          setTimeout(() => router.push("/auth/login"), 2000);
          return;
        }

        // Verificar se já tem workspace
        const { data: member, error: memberError } = await supabase
          .from("workspace_members")
          .select("workspace_id, role, status")
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();

        if (memberError) {
          console.error("[Onboarding] Erro ao buscar workspace:", memberError);
        }

        if (member?.workspace_id) {
          setStatus("done");
          setMessage("Workspace encontrado! Redirecionando...");
          setTimeout(() => router.push("/dashboard"), 1500);
          return;
        }

        // Criar workspace
        setStatus("creating");
        setMessage("Criando seu workspace pela primeira vez...");

        const userName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Studio";
        const { data: workspace, error: workspaceError } = await supabase
          .from("workspaces")
          .insert({
            owner_id: user.id,
            name: `${userName} OS`,
            plan: "starter",
            email: user.email ?? null,
          })
          .select("id")
          .single();

        if (workspaceError) {
          throw new Error(`Erro ao criar workspace: ${workspaceError.message}`);
        }

        const { error: memberInsertError } = await supabase.from("workspace_members").insert({
          workspace_id: workspace.id,
          user_id: user.id,
          email: user.email ?? null,
          role: "owner",
          status: "active",
        });

        if (memberInsertError) {
          throw new Error(`Erro ao criar membership: ${memberInsertError.message}`);
        }

        setStatus("done");
        setMessage("Workspace criado com sucesso! Redirecionando...");
        setTimeout(() => router.push("/dashboard"), 1500);
      } catch (err) {
        console.error("[Onboarding] Erro:", err);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Erro inesperado. Tente novamente.");
      }
    }

    setupWorkspace();
  }, [router]);

  return (
    <main className="app-bg grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/30 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-xl bg-orange-500 text-xl font-black text-black">
          <Film size={28} />
        </div>

        <h1 className="mt-6 text-2xl font-black">NEXO Studio OS</h1>
        <p className="mt-2 text-sm text-zinc-400">Configurando seu ambiente de trabalho</p>

        <div className="mt-8 flex flex-col items-center gap-4">
          {status === "checking" && (
            <>
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <p className="text-sm text-zinc-300">{message}</p>
            </>
          )}
          {status === "creating" && (
            <>
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <p className="text-sm text-zinc-300">{message}</p>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 animate-pulse rounded-full" style={{ width: "60%" }} />
              </div>
            </>
          )}
          {status === "done" && (
            <>
              <CheckCircle2 className="text-green-500" size={32} />
              <p className="text-sm text-green-400">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="grid size-12 place-items-center rounded-full bg-red-500/20 text-red-400 text-xl">✕</div>
              <p className="text-sm text-red-400">{message}</p>
              <button
                onClick={() => router.push("/auth/login")}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-400 transition"
              >
                Voltar para login
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
