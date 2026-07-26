import Link from 'next/link';
import { listEventosByCliente } from '@/lib/data/eventos';
import { getCaixaAbertoPorEvento } from '@/lib/data/caixas';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { getClienteAtivoId } from '@/lib/session';
import { VendaForm } from '@/components/VendaForm';
import { SemClienteAtivo } from '@/components/SemClienteAtivo';

interface VendaPageProps {
  searchParams: Promise<{ evento?: string }>;
}

export default async function VendaPage({ searchParams }: VendaPageProps) {
  const clienteId = await getClienteAtivoId();
  if (!clienteId) return <SemClienteAtivo />;

  const eventos = await listEventosByCliente(clienteId);
  const { evento: eventoParam } = await searchParams;

  if (eventos.length === 0) {
    return <p className="text-muted">Este cliente ainda não tem eventos cadastrados.</p>;
  }

  const eventoAtivo = eventos.find((e) => e.id === eventoParam) ?? eventos[0];
  const caixaAberto = await getCaixaAbertoPorEvento(eventoAtivo.id);
  const produtos = (await listProdutosByCliente(clienteId)).filter((p) => p.ativo);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Venda</h1>
        <p className="text-muted text-sm">Evento: {eventoAtivo.nome}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {eventos.map((evento) => (
          <Link
            key={evento.id}
            href={`/venda?evento=${evento.id}`}
            className={`rounded-lg px-3 py-2 text-sm border ${
              evento.id === eventoAtivo.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-muted hover:bg-surface-muted'
            }`}
          >
            {evento.nome}
          </Link>
        ))}
      </div>

      {!caixaAberto ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg p-5">
          <p className="text-warning">Não há caixa aberto para este evento.</p>
          <Link href={`/caixa?evento=${eventoAtivo.id}`} className="text-sm text-warning underline">
            Abrir caixa
          </Link>
        </div>
      ) : produtos.length === 0 ? (
        <p className="text-muted">
          Nenhum produto ativo no catálogo.{' '}
          <Link href="/produtos" className="underline">
            Cadastrar produtos
          </Link>
        </p>
      ) : (
        <VendaForm
          produtos={produtos}
          eventoId={eventoAtivo.id}
          caixaId={caixaAberto.id}
          clienteId={clienteId}
        />
      )}
    </div>
  );
}
