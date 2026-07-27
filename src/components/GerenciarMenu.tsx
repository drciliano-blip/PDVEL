'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const ITENS = [
  { href: '/clientes', label: 'Produtores' },
  { href: '/espacos', label: 'Espaços' },
  { href: '/gerenciar/operadores', label: 'Operadores & acesso' },
];

export function GerenciarMenu() {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fechar(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener('click', fechar);
    return () => document.removeEventListener('click', fechar);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground whitespace-nowrap"
      >
        Gerenciar ▾
      </button>
      {aberto && (
        <div className="absolute right-0 top-11 z-30 min-w-[180px] rounded-xl border border-border bg-surface p-1.5 shadow-lg">
          {ITENS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setAberto(false)}
              className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
