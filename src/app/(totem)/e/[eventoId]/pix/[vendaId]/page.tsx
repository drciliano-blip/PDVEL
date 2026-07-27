import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getVenda, listItensPorVenda } from '@/lib/data/vendas';
import { listFichasPorVenda } from '@/lib/data/fichas';
import { getEvento } from '@/lib/data/eventos';
import { PixQrCode } from '@/components/PixQrCode';
import { AutoRefresh } from '@/components/AutoRefresh';
import { FichaQrCode } from '@/components/FichaQrCode';
import { SalvarVendaNaCarteira } from '@/components/SalvarVendaNaCarteira';

interface CarteiraPixPageProps {
  params: Promise<{ eventoId: string; vendaId: string }>;
}

export default async function CarteiraPixPage({ params }: CarteiraPixPageProps) {
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
          <SalvarVendaNaCarteira eventoId={evento.id} vendaId={venda.id} />
          <div className="rounded-xl border border-success/30 bg-success-bg px-6 py-6 w-full">
            <p className="text-success text-2xl font-medium">✓ Pago — obrigado!</p>
          </div>
          <FichasDaVenda vendaId={venda.id} />
          <Link
            href={`/e/${evento.id}`}
            className="text-base font-medium underline underline-offset-4"
          >
            Ver minha carteira completa
          </Link>
        </>
      ) : (
        <>
          <PixQrCode qrCodeBase64={venda.pixQrCodeBase64} payload={venda.pixPayload} />
          <p className="text-muted">Escaneie para pagar. A tela atualiza sozinha ao confirmar.</p>
          <AutoRefresh />
        </>
      )}
    </div>
  );
}

async function FichasDaVenda({ vendaId }: { vendaId: string }) {
  const fichas = await listFichasPorVenda(vendaId);
  if (fichas.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
      {fichas.map((ficha) => (
        <div key={ficha.id} className="flex flex-col items-center gap-1 rounded-lg border border-border p-3">
          <FichaQrCode codigo={ficha.codigo} />
          <p className="text-xs font-mono tracking-widest">{ficha.codigo}</p>
          <p className="text-xs text-muted">{ficha.nomeProduto}</p>
          {ficha.produtoAlcoolico && <p className="text-xs text-warning">🔞</p>}
        </div>
      ))}
    </div>
  );
}
