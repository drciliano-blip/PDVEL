import Link from 'next/link';

export function SemClienteAtivo() {
  return (
    <p className="text-muted">
      Nenhuma empresa-cliente cadastrada ainda.{' '}
      <Link href="/clientes" className="text-accent underline">
        Cadastre uma em Clientes
      </Link>{' '}
      para continuar.
    </p>
  );
}
