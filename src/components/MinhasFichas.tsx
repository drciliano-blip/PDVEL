'use client';

import { useCallback, useEffect, useState } from 'react';
import { listarVendasDaCarteira } from '@/lib/carteira';
import { buscarCarteiraAction, type CarteiraVenda } from '@/app/(totem)/e/actions';
import { FichaQrCode } from '@/components/FichaQrCode';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const STATUS_FICHA_LABEL = {
  emitida: 'Pronta para retirada',
  resgatada: 'Já resgatada',
  cancelada: 'Cancelada',
} as const;

export function MinhasFichas({ eventoId }: { eventoId: string }) {
  const [vendas, setVendas] = useState<CarteiraVenda[] | null>(null);

  const sincronizar = useCallback(() => {
    const vendaIds = listarVendasDaCarteira(eventoId);
    const resultado = vendaIds.length === 0 ? Promise.resolve([]) : buscarCarteiraAction(eventoId, vendaIds);
    resultado.then(setVendas);
  }, [eventoId]);

  useEffect(() => {
    sincronizar();
    const intervalo = setInterval(sincronizar, 5000);
    return () => clearInterval(intervalo);
  }, [sincronizar]);

  if (vendas === null || vendas.length === 0) return null;

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-semibold">Minha carteira</h2>
      {vendas
        .slice()
        .reverse()
        .map(({ venda, itens, fichas }) => (
          <div key={venda.id} className="flex flex-col gap-3 border-t border-border pt-3 first:border-0 first:pt-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">
                {itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}
              </p>
              <Badge tone={venda.statusPagamento === 'pago' ? 'success' : venda.statusPagamento === 'pendente' ? 'neutral' : 'danger'}>
                {venda.statusPagamento === 'pago'
                  ? 'Pago'
                  : venda.statusPagamento === 'pendente'
                    ? 'Aguardando pagamento'
                    : 'Cancelado'}
              </Badge>
            </div>
            {fichas.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fichas.map((ficha) => (
                  <div
                    key={ficha.id}
                    className="flex flex-col items-center gap-1 rounded-lg border border-border p-3 text-center"
                  >
                    <FichaQrCode codigo={ficha.codigo} />
                    <p className="text-xs font-mono tracking-widest">{ficha.codigo}</p>
                    <p className="text-xs text-muted">{ficha.nomeProduto}</p>
                    <p className="text-xs">{STATUS_FICHA_LABEL[ficha.status]}</p>
                    {ficha.produtoAlcoolico && ficha.status === 'emitida' && (
                      <p className="text-xs text-warning">🔞</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </Card>
  );
}
