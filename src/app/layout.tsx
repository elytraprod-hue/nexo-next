import type { Metadata } from "next";
import { DM_Sans, Geist_Mono, Syne } from "next/font/google";
import { WorkspaceProvider } from "@/hooks/use-workspace-state";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXO Central",
  description: "Sistema operacional para produtoras audiovisuais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
