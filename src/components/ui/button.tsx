import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "ghost" | "success" | "danger";
  }
>;

const variants = {
  primary: "border-transparent bg-orange-500 text-black hover:bg-orange-400",
  ghost: "border-white/10 bg-white/[0.06] text-zinc-200 hover:bg-white/[0.1]",
  success: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300 hover:bg-emerald-400/20",
  danger: "border-red-400/30 bg-red-400/15 text-red-300 hover:bg-red-400/20",
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
