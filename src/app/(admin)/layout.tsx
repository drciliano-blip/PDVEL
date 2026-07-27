import type { Metadata } from "next";
import Link from "next/link";
import "../globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { listClientes } from "@/lib/data/clientes";
import { getClienteAtivoId } from "@/lib/session";
import { ClienteSelector } from "@/components/ClienteSelector";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { ThemeScript } from "@/components/ThemeScript";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GerenciarMenu } from "@/components/GerenciarMenu";

export const metadata: Metadata = {
  title: "PDV de Eventos",
  description: "Protótipo de PDV multi-tenant para consumo em eventos",
  manifest: "/admin-manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientes = await listClientes();
  const ativoId = await getClienteAtivoId();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RegisterServiceWorker />
        <header className="print:hidden border-b border-border px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start gap-6">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-lg">PDV de Eventos</span>
              <OnlineStatusIndicator />
            </div>
            <div className="sm:hidden">
              <ClienteSelector clientes={clientes} ativoId={ativoId} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <ClienteSelector clientes={clientes} ativoId={ativoId} />
            </div>
            <GerenciarMenu />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-5xl w-full mx-auto print:p-0 print:max-w-none">{children}</main>
        <footer className="print:hidden border-t border-border px-4 sm:px-6 py-4 text-xs text-muted flex justify-between">
          <span>PDV de Eventos — protótipo</span>
          <Link href="/privacidade" className="underline hover:text-foreground">
            Política de Privacidade
          </Link>
        </footer>
      </body>
    </html>
  );
}
