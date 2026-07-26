import Link from 'next/link';
import { getCliente } from '@/lib/data/clientes';
import { listEventosByCliente } from '@/lib/data/eventos';
import { getClienteAtivoId } from '@/lib/session';
import { Card } from '@/components/ui/Card';

const ATALHOS = [
  { href: '/produtos', titulo: 'Produtos', descricao: 'Cardápio do cliente ativo.' },
  { href: '/caixa', titulo: 'Caixa', descricao: 'Abrir ou fechar o caixa de um evento.' },
  { href: '/venda', titulo: 'Venda', descricao: 'Tela do PDV: grade, carrinho, pagamento.' },
  { href: '/relatorios', titulo: 'Relatórios', descricao: 'Totais de vendas do cliente ativo.' },
];

export default async function Home() {
  const clienteId = await getClienteAtivoId();

  if (!clienteId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Bem-vindo</h1>
        <p className="text-muted">
          Nenhuma empresa-cliente cadastrada ainda.{' '}
          <Link href="/clientes" className="text-accent underline">
            Cadastre a primeira em Clientes
          </Link>{' '}
          para começar.
        </p>
      </div>
    );
  }

  const cliente = await getCliente(clienteId);
  const eventos = await listEventosByCliente(clienteId);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Olá, {cliente?.nome}</h1>
        <p className="text-muted text-sm">
          {eventos.length} evento(s) cadastrado(s) para este cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ATALHOS.map((atalho) => (
          <Link key={atalho.href} href={atalho.href} className="block">
            <Card className="h-full hover:border-accent/60 transition-colors">
              <h2 className="font-semibold">{atalho.titulo}</h2>
              <p className="text-sm text-muted mt-1">{atalho.descricao}</p>
            </Card>
          </Link>
        ))}
      </div>

      {eventos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Totem de autoatendimento
          </h2>
          <Card padding={false} className="divide-y divide-border">
            {eventos.map((evento) => (
              <div key={evento.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="text-sm">{evento.nome}</span>
                <Link href={`/totem/${evento.id}`} className="text-sm text-accent underline">
                  Abrir totem
                </Link>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
