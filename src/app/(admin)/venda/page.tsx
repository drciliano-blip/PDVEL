import Link from 'next/link';
import { listEventosByCliente } from '@/lib/data/eventos';
import { getCaixaAbertoPorEvento } from '@/lib/data/caixas';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { getClienteAtivoId } from '@/lib/session';
import { VendaForm } from '@/components/VendaForm';

interface VendaPageProps {
  searchParams: Promise<{ evento?: string }>;
}

export default async function VendaPage({ searchParams }: VendaPageProps) {
  const clienteId = await getClienteAtivoId();
  const eventos = await listEventosByCliente(clienteId);
  const { evento: eventoParam } = await searchParams;

  if (eventos.length === 0) {
    return <p className="text-neutral-400">Este cliente ainda não tem eventos cadastrados.</p>;
  }

  const eventoAtivo = eventos.find((e) => e.id === eventoParam) ?? eventos[0];
  const caixaAberto = await getCaixaAbertoPorEvento(eventoAtivo.id);
  const produtos = (await listProdutosByCliente(clienteId)).filter((p) => p.ativo);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Venda</h1>
        <p className="text-neutral-400 text-sm">Evento: {eventoAtivo.nome}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {eventos.map((evento) => (
          <Link
            key={evento.id}
            href={`/venda?evento=${evento.id}`}
            className={`rounded-md px-3 py-1.5 text-sm border ${
              evento.id === eventoAtivo.id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-neutral-800 text-neutral-300 hover:border-neutral-600'
            }`}
          >
            {evento.nome}
          </Link>
        ))}
      </div>

      {!caixaAberto ? (
        <div className="rounded-lg border border-amber-800 bg-amber-950/30 p-5">
          <p className="text-amber-300">Não há caixa aberto para este evento.</p>
          <Link
            href={`/caixa?evento=${eventoAtivo.id}`}
            className="text-sm text-amber-200 underline"
          >
            Abrir caixa
          </Link>
        </div>
      ) : produtos.length === 0 ? (
        <p className="text-neutral-400">
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
