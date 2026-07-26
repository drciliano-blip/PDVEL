import { notFound } from 'next/navigation';
import { getVenda, listItensPorVenda } from '@/lib/data/vendas';
import { getEvento } from '@/lib/data/eventos';
import { PixQrCode } from '@/components/PixQrCode';
import { PixStatusPoller } from '@/components/PixStatusPoller';
import { TotemAutoReset } from '@/components/TotemAutoReset';
import { PrintButton } from '@/components/PrintButton';

interface TotemPixPageProps {
  params: Promise<{ eventoId: string; vendaId: string }>;
}

export default async function TotemPixPage({ params }: TotemPixPageProps) {
  const { eventoId, vendaId } = await params;
  const evento = await getEvento(eventoId);
  const venda = await getVenda(vendaId);

  if (!evento || !venda || venda.eventoId !== evento.id || !venda.pixQrCodeBase64 || !venda.pixPayload) {
    notFound();
  }

  const itens = await listItensPorVenda(venda.id);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-2xl font-semibold">Seu pedido</h1>

      <ul className="w-full text-left">
        {itens.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.quantidade}x {item.nome}
            </span>
            <span>R$ {item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between w-full font-semibold border-t border-border pt-3 text-xl">
        <span>Total</span>
        <span>R$ {venda.total.toFixed(2)}</span>
      </div>

      {venda.statusPagamento === 'pago' ? (
        <>
          <div className="rounded-xl border border-success/30 bg-success-bg px-6 py-6 w-full">
            <p className="text-success text-2xl font-medium">✓ Pago — obrigado!</p>
          </div>
          <PrintButton label="Imprimir comprovante" />
          <TotemAutoReset eventoId={evento.id} />
        </>
      ) : (
        <>
          <PixQrCode qrCodeBase64={venda.pixQrCodeBase64} payload={venda.pixPayload} />
          <p className="text-muted">Escaneie para pagar. A tela atualiza sozinha ao confirmar.</p>
          <PixStatusPoller />
        </>
      )}
    </div>
  );
}
