import type { Metadata } from 'next';
import '../globals.css';
import { geistSans, geistMono } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Totem de Autoatendimento',
  description: 'Autoatendimento do convidado no evento',
};

export default function TotemLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground text-lg">
        <main className="flex-1 px-6 py-10 max-w-3xl w-full mx-auto flex flex-col gap-6">
          {children}
        </main>
      </body>
    </html>
  );
}
