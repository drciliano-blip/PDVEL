'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarVendaAction } from '@/app/(admin)/venda/actions';
import { IdentificarConvidado } from '@/components/IdentificarConvidado';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Produto, Convidado } from '@/lib/data/types';

interface TotemCheckoutProps {
  produtos: Produto[];
  eventoId: string;
  caixaId: string;
  clienteId: string;
}

export function TotemCheckout({ produtos, eventoId, caixaId, clienteId }: TotemCheckoutProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const porCategoria = useMemo(() => {
    const map = new Map<string, Produto[]>();
    for (const produto of produtos) {
      const lista = map.get(produto.categoria) ?? [];
      lista.push(produto);
      map.set(produto.categoria, lista);
    }
    return map;
  }, [produtos]);

  const itensCarrinho = useMemo(
    () =>
      produtos
        .filter((p) => (quantidades[p.id] ?? 0) > 0)
        .map((p) => ({
          produtoId: p.id,
          nome: p.nome,
          precoUnit: p.preco,
          quantidade: quantidades[p.id],
        })),
    [produtos, quantidades]
  );

  const total = itensCarrinho.reduce((sum, i) => sum + i.precoUnit * i.quantidade, 0);

  function alterarQuantidade(produtoId: string, delta: number) {
    setQuantidades((atual) => {
      const nova = Math.max(0, (atual[produtoId] ?? 0) + delta);
      return { ...atual, [produtoId]: nova };
    });
  }

  function pagarComPix() {
    setErro(null);
    startTransition(async () => {
      try {
        const venda = await criarVendaAction({
          eventoId,
          caixaId,
          clienteId,
          convidadoId: convidado?.id ?? null,
          itens: itensCarrinho,
          formaPagamento: 'pix',
        });
        router.push(`/totem/${eventoId}/pix/${venda.id}`);
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao registrar o pedido.');
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <IdentificarConvidado
          clienteId={clienteId}
          eventoId={eventoId}
          onConvidadoChange={setConvidado}
        />

        {Array.from(porCategoria.entries()).map(([categoria, itens]) => (
          <div key={categoria}>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-2">
              {categoria}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {itens.map((produto) => (
                <div
                  key={produto.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <p>{produto.nome}</p>
                    <p className="text-base text-muted">R$ {produto.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(produto.id, -1)}
                      className="w-14 h-14 rounded-xl border border-border text-2xl hover:bg-surface-muted"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{quantidades[produto.id] ?? 0}</span>
                    <button
                      type="button"
                      onClick={() => alterarQuantidade(produto.id, 1)}
                      className="w-14 h-14 rounded-xl border border-border text-2xl hover:bg-surface-muted"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="sticky top-4 flex flex-col gap-4">
        <h2 className="font-semibold">Seu pedido</h2>
        {itensCarrinho.length === 0 ? (
          <p className="text-base text-muted">Toque nos produtos para adicionar.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {itensCarrinho.map((item) => (
              <li key={item.produtoId} className="flex justify-between">
                <span>
                  {item.quantidade}x {item.nome}
                </span>
                <span className="text-muted">R$ {(item.precoUnit * item.quantidade).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-between border-t border-border pt-3 font-semibold text-xl">
          <span>Total</span>
          <span>R$ {total.toFixed(2)}</span>
        </div>

        {erro && <p className="text-base text-danger">{erro}</p>}

        <Button
          type="button"
          size="lg"
          disabled={isPending || itensCarrinho.length === 0}
          onClick={pagarComPix}
        >
          Pagar com PIX
        </Button>
      </Card>
    </div>
  );
}
