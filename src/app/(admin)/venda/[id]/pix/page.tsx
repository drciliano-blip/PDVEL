import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVenda, listItensPorVenda } from '@/lib/data/vendas';
import { getClienteAtivoId } from '@/lib/session';
import { PixQrCode } from '@/components/PixQrCode';
import { PixStatusPoller } from '@/components/PixStatusPoller';

interface PixPageProps {
  params: Promise<{ id: string }>;
}

export default async function PixPage({ params }: PixPageProps) {
  const { id } = await params;
  const clienteId = await getClienteAtivoId();
  const venda = await getVenda(id);

  if (!venda || venda.clienteId !== clienteId || !venda.pixQrCodeBase64 || !venda.pixPayload) {
    notFound();
  }

  const itens = await listItensPorVenda(venda.id);

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md mx-auto">
      <h1 className="text-2xl font-semibold">Cobrança PIX</h1>

      <ul className="text-sm text-muted self-stretch text-left">
        {itens.map((item) => (
          <li key={item.id} className="flex justify-between">
            <span>
              {item.quantidade}x {item.nome}
            </span>
            <span>R$ {item.subtotal.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between w-full font-semibold border-t border-border pt-3">
        <span>Total</span>
        <span>R$ {venda.total.toFixed(2)}</span>
      </div>

      {venda.statusPagamento === 'pago' ? (
        <div className="rounded-lg border border-success/30 bg-success-bg px-6 py-4 w-full flex flex-col gap-2">
          <p className="text-success font-medium">✓ Pago</p>
          <p className="text-xs text-muted">
            Confirmado em {venda.pagoEm && new Date(venda.pagoEm).toLocaleString('pt-BR')}
          </p>
          <Link href={`/venda/${venda.id}/recibo`} className="text-sm text-accent underline">
            Ver recibo
          </Link>
        </div>
      ) : (
        <>
          <PixQrCode qrCodeBase64={venda.pixQrCodeBase64} payload={venda.pixPayload} />
          <p className="text-sm text-muted">
            Aguardando confirmação do pagamento — a tela atualiza sozinha.
          </p>
          <PixStatusPoller />
        </>
      )}

      <Link href="/venda" className="text-sm text-muted underline">
        Voltar para o PDV
      </Link>
    </div>
  );
}
