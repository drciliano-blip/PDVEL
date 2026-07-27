'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HubTabs({ eventoId }: { eventoId: string }) {
  const pathname = usePathname();
  const base = `/eventos/${eventoId}`;

  const abas = [
    { href: base, label: 'Ao vivo' },
    { href: `${base}/cardapio`, label: 'Cardápio' },
    { href: `${base}/caixa`, label: 'Caixa' },
    { href: `${base}/venda`, label: 'Venda' },
    { href: `${base}/fichas`, label: 'Fichas' },
    { href: `${base}/relatorios`, label: 'Relatórios' },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border">
      {abas.map((aba) => {
        const ativo = aba.href === base ? pathname === base : pathname.startsWith(aba.href);
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={
              ativo
                ? 'px-4 py-3 text-sm font-semibold border-b-2 border-accent text-accent whitespace-nowrap'
                : 'px-4 py-3 text-sm font-semibold border-b-2 border-transparent text-muted hover:text-foreground whitespace-nowrap'
            }
          >
            {aba.label}
          </Link>
        );
      })}
    </nav>
  );
}
