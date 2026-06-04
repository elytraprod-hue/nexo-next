"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizando login com GitHub...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setErrorMessage("Supabase não está configurado neste ambiente.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const authError = params.get("error_description") || params.get("error");

    if (authError) {
      setErrorMessage(authError);
      return;
    }

    if (!code) {
      setErrorMessage("O GitHub não retornou o código de autenticação.");
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(({ data, error }) => {
        if (error) throw error;
        if (!data.session) throw new Error("Sessão não foi criada pelo Supabase.");
        setMessage("Login concluído. Abrindo seu workspace...");
        router.replace("/dashboard");
      })
      .catch((error) => {
        setErrorMessage(error instanceof Error ? error.message : "Não foi possível finalizar o login.");
      });
  }, [router]);

  return (
    <main className="app-bg grid min-h-screen place-items-center px-6 text-center text-zinc-200">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/30">
        <div className="mx-auto grid size-12 place-items-center rounded-xl bg-orange-500 text-xl font-black text-black">N</div>
        <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-orange-300">GitHub OAuth</p>
        <h1 className="mt-3 text-2xl font-black">{errorMessage ? "Login não concluído" : message}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {errorMessage || "Aguarde enquanto o NEXO confirma sua sessão e restaura o workspace."}
        </p>
        {errorMessage ? (
          <button className="mt-6 min-h-12 w-full rounded-lg bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400" type="button" onClick={() => router.replace("/")}>
            Voltar e tentar novamente
          </button>
        ) : null}
      </div>
    </main>
  );
}
