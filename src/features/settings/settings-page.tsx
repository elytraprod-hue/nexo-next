"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Building2, Landmark, Save, Share2, Signature } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { useWorkspaceState } from "@/hooks/use-workspace-state";
import type { BusinessProfile } from "@/lib/workspace-state";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
      {label}
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="focus-ring min-h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function Area({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <textarea
      className="focus-ring min-h-28 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm font-bold normal-case tracking-normal text-white placeholder:text-zinc-600"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function SettingsPage() {
  const { state, actions, ready, syncStatus } = useWorkspaceState();
  const [draft, setDraft] = useState<BusinessProfile>(state.businessProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(state.businessProfile);
  }, [state.businessProfile]);

  function patch(input: Partial<BusinessProfile>) {
    setDraft((current) => ({ ...current, ...input }));
    setSaved(false);
  }

  function save() {
    actions.updateBusinessProfile(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2800);
  }

  const profileScore = [draft.name, draft.email, draft.phone, draft.logoUrl, draft.defaultSignature, draft.bankInfo].filter(Boolean).length;

  return (
    <AppShell
      eyebrow="Configuração do negócio"
      primaryAction={{ href: "/studio", label: "Gerar PDF" }}
      subtitle="Dados da produtora usados em propostas, contratos, recibos, relatórios e entregas."
      title="Empresa"
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-4">
          <Surface>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="text-orange-400" />
                <div>
                  <h2 className="text-xl font-black">Identidade da produtora</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">Base legal, marca e canais oficiais.</p>
                </div>
              </div>
              <Button disabled={!ready} onClick={save}>
                <Save size={17} />
                Salvar
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Field label="Nome comercial">
                <Input value={draft.name} onChange={(value) => patch({ name: value })} placeholder="Nome da produtora" />
              </Field>
              <Field label="Razão social">
                <Input value={draft.legalName} onChange={(value) => patch({ legalName: value })} placeholder="Razão social completa" />
              </Field>
              <Field label="CNPJ/Documento">
                <Input value={draft.documentNumber} onChange={(value) => patch({ documentNumber: value })} placeholder="00.000.000/0001-00" />
              </Field>
              <Field label="Logo URL">
                <Input value={draft.logoUrl} onChange={(value) => patch({ logoUrl: value })} placeholder="https://..." />
              </Field>
              <Field label="Telefone">
                <Input value={draft.phone} onChange={(value) => patch({ phone: value })} placeholder="(00) 00000-0000" />
              </Field>
              <Field label="E-mail">
                <Input value={draft.email} onChange={(value) => patch({ email: value })} placeholder="contato@produtora.com" type="email" />
              </Field>
              <Field label="Site">
                <Input value={draft.siteUrl} onChange={(value) => patch({ siteUrl: value })} placeholder="https://..." />
              </Field>
              <Field label="Endereço">
                <Input value={draft.address} onChange={(value) => patch({ address: value })} placeholder="Cidade, UF ou endereço completo" />
              </Field>
            </div>
          </Surface>

          <section className="grid gap-4 xl:grid-cols-2">
            <Surface>
              <div className="flex items-center gap-3">
                <Share2 className="text-cyan-300" />
                <h2 className="text-xl font-black">Redes e presença</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <Field label="Instagram">
                  <Input value={draft.socialInstagram} onChange={(value) => patch({ socialInstagram: value })} placeholder="@produtora" />
                </Field>
                <Field label="LinkedIn">
                  <Input value={draft.socialLinkedin} onChange={(value) => patch({ socialLinkedin: value })} placeholder="linkedin.com/company/..." />
                </Field>
                <Field label="YouTube/Vimeo">
                  <Input value={draft.socialYoutube} onChange={(value) => patch({ socialYoutube: value })} placeholder="Canal ou portfólio" />
                </Field>
              </div>
            </Surface>

            <Surface>
              <div className="flex items-center gap-3">
                <Signature className="text-violet-300" />
                <h2 className="text-xl font-black">Assinatura padrão</h2>
              </div>
              <div className="mt-5 grid gap-3">
                <Field label="Assinatura">
                  <Area value={draft.defaultSignature} onChange={(value) => patch({ defaultSignature: value })} placeholder="Nome, função, contato e fechamento padrão" />
                </Field>
              </div>
            </Surface>
          </section>

          <Surface>
            <div className="flex items-center gap-3">
              <Landmark className="text-emerald-300" />
              <h2 className="text-xl font-black">Financeiro e fiscal</h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Field label="Dados bancários">
                <Area value={draft.bankInfo} onChange={(value) => patch({ bankInfo: value })} placeholder="Banco, chave Pix, agência, conta, favorecido" />
              </Field>
              <Field label="Informações fiscais">
                <Area value={draft.fiscalInfo} onChange={(value) => patch({ fiscalInfo: value })} placeholder="Observações fiscais, retenções, NF, condições" />
              </Field>
            </div>
          </Surface>
        </div>

        <aside className="grid content-start gap-4">
          <Surface>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Preview da marca</p>
            <div className="mt-5 rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-5">
              {draft.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`Logo ${draft.name}`} className="h-16 max-w-44 object-contain" src={draft.logoUrl} />
              ) : (
                <div className="grid size-16 place-items-center rounded-2xl bg-orange-500 text-2xl font-black text-black">{draft.name.slice(0, 1) || "N"}</div>
              )}
              <h3 className="mt-5 text-3xl font-black leading-none">{draft.name || "Sua produtora"}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{draft.legalName || "Razão social ainda não definida"}</p>
              <div className="mt-5 grid gap-2 text-sm font-bold text-zinc-300">
                <span>{draft.email || "E-mail não definido"}</span>
                <span>{draft.phone || "Telefone não definido"}</span>
                <span>{draft.siteUrl || "Site não definido"}</span>
              </div>
            </div>
          </Surface>

          <Surface>
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-1 text-emerald-300" />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-300">Pronto para documentos</p>
                <h3 className="mt-2 text-2xl font-black">{profileScore}/6 bases</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">Logo, assinatura, contato e dados bancários entram automaticamente nos PDFs.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Sincronização</p>
              <p className="mt-2 text-sm font-bold text-zinc-300">{syncStatus === "cloud" ? "Supabase conectado" : "Modo local"}</p>
            </div>
            {saved ? <p className="mt-4 text-sm font-black text-emerald-300">Configurações salvas.</p> : null}
          </Surface>
        </aside>
      </section>
    </AppShell>
  );
}
