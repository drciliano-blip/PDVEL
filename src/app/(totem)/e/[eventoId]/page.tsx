import { notFound } from 'next/navigation';
import { getEvento } from '@/lib/data/eventos';
import { getCaixaAbertoPorEvento } from '@/lib/data/caixas';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { TotemCheckout } from '@/components/TotemCheckout';
import { MinhasFichas } from '@/components/MinhasFichas';

interface CarteiraPageProps {
  params: Promise<{ eventoId: string }>;
}

export default async function CarteiraPage({ params }: CarteiraPageProps) {
  const { eventoId } = await params;
  const evento = await getEvento(eventoId);
  if (!evento) notFound();

  const caixaAberto = await getCaixaAbertoPorEvento(evento.id);
  const produtos = (await listProdutosByCliente(evento.clienteId)).filter((p) => p.ativo);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{evento.nome}</h1>
        <p className="text-muted mt-1">Monte seu pedido e pague por PIX, direto do seu celular.</p>
      </div>

      <MinhasFichas eventoId={evento.id} />

      {!caixaAberto ? (
        <p className="text-center text-muted">
          As vendas ainda não estão abertas para este evento — aguarde a equipe do evento.
        </p>
      ) : produtos.length === 0 ? (
        <p className="text-center text-muted">Nenhum produto disponível no momento.</p>
      ) : (
        <TotemCheckout
          produtos={produtos}
          eventoId={evento.id}
          caixaId={caixaAberto.id}
          clienteId={evento.clienteId}
          pixBasePath="/e"
        />
      )}
    </div>
  );
}
