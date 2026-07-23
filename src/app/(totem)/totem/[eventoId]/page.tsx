import { notFound } from 'next/navigation';
import { getEvento } from '@/lib/data/eventos';
import { getCaixaAbertoPorEvento } from '@/lib/data/caixas';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { TotemCheckout } from '@/components/TotemCheckout';

interface TotemPageProps {
  params: Promise<{ eventoId: string }>;
}

export default async function TotemPage({ params }: TotemPageProps) {
  const { eventoId } = await params;
  const evento = await getEvento(eventoId);
  if (!evento) notFound();

  const caixaAberto = await getCaixaAbertoPorEvento(evento.id);
  const produtos = (await listProdutosByCliente(evento.clienteId)).filter((p) => p.ativo);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{evento.nome}</h1>
        <p className="text-muted mt-1">Bem-vindo! Monte seu pedido e pague por PIX.</p>
      </div>

      {!caixaAberto ? (
        <p className="text-center text-muted">
          Este totem ainda não está disponível — aguarde a abertura do caixa pela equipe do
          evento.
        </p>
      ) : produtos.length === 0 ? (
        <p className="text-center text-muted">Nenhum produto disponível no momento.</p>
      ) : (
        <TotemCheckout
          produtos={produtos}
          eventoId={evento.id}
          caixaId={caixaAberto.id}
          clienteId={evento.clienteId}
        />
      )}
    </div>
  );
}
