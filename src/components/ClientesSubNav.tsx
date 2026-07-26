import Link from 'next/link';

const ABAS = [
  { href: '/clientes', label: 'Clientes', chave: 'clientes' },
  { href: '/clientes/eventos', label: 'Eventos', chave: 'eventos' },
] as const;

export function ClientesSubNav({ ativo }: { ativo: 'clientes' | 'eventos' }) {
  return (
    <nav className="flex gap-1 text-sm border-b border-border">
      {ABAS.map((aba) => (
        <Link
          key={aba.chave}
          href={aba.href}
          className={
            aba.chave === ativo
              ? 'px-3 py-2 border-b-2 border-accent text-accent font-medium'
              : 'px-3 py-2 text-muted hover:text-foreground'
          }
        >
          {aba.label}
        </Link>
      ))}
    </nav>
  );
}
