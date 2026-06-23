"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="app-bg grid min-h-screen place-items-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <h1 className="text-2xl font-black text-red-400">Erro no NEXO</h1>
        <p className="mt-4 text-sm text-zinc-400">
          {error.message || "Ocorreu um erro inesperado."}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-zinc-600">ID: {error.digest}</p>
        )}
        <button
          onClick={() => reset()}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-400 transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
