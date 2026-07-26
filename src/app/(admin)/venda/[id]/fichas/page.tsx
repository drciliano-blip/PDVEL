import { notFound } from 'next/navigation';
import { getVenda } from '@/lib/data/vendas';
import { getEvento } from '@/lib/data/eventos';
import { listFichasPorVenda } from '@/lib/data/fichas';
import { getClienteAtivoId } from '@/lib/session';
import { PrintButton } from '@/components/PrintButton';
import { FichaQrCode } from '@/components/FichaQrCode';
import { Badge } from '@/components/ui/Badge';

interface FichasPageProps {
  params: Promise<{ id: string }>;
}

export default async function FichasPage({ params }: FichasPageProps) {
  const { id } = await params;
  const clienteId = await getClienteAtivoId();
  const venda = await getVenda(id);

  if (!venda || venda.clienteId !== clienteId) {
    notFound();
  }

  const [evento, fichas] = await Promise.all([getEvento(venda.eventoId), listFichasPorVenda(venda.id)]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold">Fichas de retirada</h1>
          <p className="text-muted text-sm">{fichas.length} ficha(s) desta venda.</p>
        </div>
        <PrintButton />
      </div>

      {fichas.length === 0 ? (
        <p className="text-muted">Nenhuma ficha gerada para esta venda (venda ainda não paga?).</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 print:grid-cols-3">
          {fichas.map((ficha) => (
            <div
              key={ficha.id}
              className="break-inside-avoid rounded-lg border border-border p-3 flex flex-col items-center gap-1 text-center"
            >
              <p className="text-xs text-muted">{evento?.nome}</p>
              <p className="font-semibold">{ficha.nomeProduto}</p>
              <FichaQrCode codigo={ficha.codigo} />
              <p className="font-mono text-lg tracking-widest">{ficha.codigo}</p>
              {ficha.status !== 'emitida' && (
                <Badge tone={ficha.status === 'resgatada' ? 'neutral' : 'danger'}>
                  {ficha.status === 'resgatada' ? 'Já resgatada' : 'Cancelada'}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
