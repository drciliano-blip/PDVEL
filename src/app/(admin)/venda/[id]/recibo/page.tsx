import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVenda, listItensPorVenda } from '@/lib/data/vendas';
import { getClienteAtivoId } from '@/lib/session';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PrintButton } from '@/components/PrintButton';

interface ReciboPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
} as const;

export default async function ReciboPage({ params }: ReciboPageProps) {
  const { id } = await params;
  const clienteId = await getClienteAtivoId();
  const venda = await getVenda(id);

  if (!venda || venda.clienteId !== clienteId) {
    notFound();
  }

  const itens = await listItensPorVenda(venda.id);

  return (
    <div className="max-w-md mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-semibold">Recibo</h1>
        <div className="flex gap-2">
          {venda.statusPagamento === 'pago' && (
            <Link href={`/venda/${venda.id}/fichas`}>
              <Button type="button" variant="secondary">
                Imprimir fichas
              </Button>
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="text-center border-b border-border pb-4">
          <p className="font-semibold">Comprovante de venda</p>
          <p className="text-xs text-muted">
            {new Date(venda.criadoEm).toLocaleString('pt-BR')} · #{venda.id.slice(-8)}
          </p>
        </div>

        <ul className="flex flex-col gap-1 text-sm">
          {itens.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.quantidade}x {item.nome}
              </span>
              <span>R$ {item.subtotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-border pt-3 font-semibold">
          <span>Total</span>
          <span>R$ {venda.total.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-sm text-muted">
          <span>Forma de pagamento</span>
          <span>{venda.formaPagamento === 'pix' ? 'PIX' : 'Dinheiro'}</span>
        </div>
        <div className="flex justify-between text-sm text-muted">
          <span>Status</span>
          <span>{STATUS_LABEL[venda.statusPagamento]}</span>
        </div>
        {venda.statusPagamento === 'cancelado' && (
          <p className="text-xs text-danger text-center">
            Venda cancelada em {venda.canceladoEm && new Date(venda.canceladoEm).toLocaleString('pt-BR')}
            {venda.canceladoPor && ` por ${venda.canceladoPor}`}.
          </p>
        )}
      </Card>
    </div>
  );
}
