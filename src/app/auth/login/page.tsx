"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { LogIn, AlertTriangle, GitHub, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mode, setMode] = useState<"github" | "email">("github");

  useEffect(() => {
    if (errorParam) {
      const errorMap: Record<string, string> = {
        missing_code: "Código de autorização ausente. Tente novamente.",
        auth_exchange_failed: "Falha na autenticação com GitHub. Tente novamente.",
        no_session: "Sessão não criada. Verifique sua conta GitHub.",
        workspace_creation_failed: "Erro ao criar workspace. Contate o suporte.",
        unexpected: "Erro inesperado. Tente novamente mais tarde.",
      };
      setErrorMessage(errorMap[errorParam] ?? "Erro desconhecido. Tente novamente.");
    }
  }, [errorParam]);

  const supabase = getSupabaseBrowserClient();
  const isConfigured = Boolean(supabase);

  async function handleGithubLogin() {
    if (!supabase) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo },
      });

      if (error) {
        setErrorMessage(`GitHub: ${error.message}`);
      }
    } catch (err) {
      setErrorMessage("Erro ao conectar com GitHub. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos." 
          : error.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      setErrorMessage("Erro ao fazer login. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !email.trim() || !password.trim()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Conta criada! Verifique seu email para confirmar.");
      }
    } catch (err) {
      setErrorMessage("Erro ao criar conta. Tente novamente.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-bg grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-8 shadow-2xl shadow-black/30">
        <div className="mx-auto grid size-16 place-items-center rounded-xl bg-orange-500 text-xl font-black text-black">
          N
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-orange-300">Acesso interno</p>
        <h1 className="mt-3 text-2xl font-black">Entrar no NEXO Studio OS</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Sistema operacional para produtoras audiovisuais.
        </p>

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!isConfigured && (
          <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-400">
            ⚠️ Supabase não configurado. Verifique as variáveis de ambiente.
          </div>
        )}

        <div className="mt-6 flex rounded-lg bg-zinc-900 p-1">
          <button
            onClick={() => setMode("github")}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition ${
              mode === "github" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <GitHub size={14} className="inline mr-1" /> GitHub
          </button>
          <button
            onClick={() => setMode("email")}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition ${
              mode === "email" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Mail size={14} className="inline mr-1" /> Email
          </button>
        </div>

        {mode === "github" ? (
          <button
            onClick={handleGithubLogin}
            disabled={!isConfigured || isLoading}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <LogIn size={18} />
            )}
            {isLoading ? "Conectando..." : "Entrar com GitHub"}
          </button>
        ) : (
          <form onSubmit={handleEmailLogin} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-orange-500 focus:outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={!isConfigured || isLoading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 text-sm font-black text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <LogIn size={18} />
              )}
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
            <button
              type="button"
              onClick={handleSignup}
              disabled={!isConfigured || isLoading}
              className="w-full text-center text-xs text-zinc-500 hover:text-orange-400 transition"
            >
              Criar nova conta
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-zinc-600">
          Ao entrar, você concorda com os termos de uso.
        </p>
      </div>
    </main>
  );
}
