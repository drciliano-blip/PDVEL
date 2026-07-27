'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { criarVendaAction } from '@/app/(admin)/venda/actions';
import { IdentificarConvidado } from '@/components/IdentificarConvidado';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Produto, FormaPagamento, Convidado } from '@/lib/data/types';

interface VendaFormProps {
  produtos: Produto[];
  eventoId: string;
  caixaId: string;
  clienteId: string;
}

export function VendaForm({ produtos, eventoId, caixaId, clienteId }: VendaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

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

  function alterarQuantidade(produto: Produto, delta: number) {
    setQuantidades((atual) => {
      const limite = produto.estoque ?? Infinity;
      const nova = Math.min(limite, Math.max(0, (atual[produto.id] ?? 0) + delta));
      return { ...atual, [produto.id]: nova };
    });
  }

  function finalizarVenda(formaPagamento: FormaPagamento) {
    setErro(null);
    startTransition(async () => {
      try {
        const venda = await criarVendaAction({
          eventoId,
          caixaId,
          clienteId,
          convidadoId: convidado?.id ?? null,
          itens: itensCarrinho,
          formaPagamento,
          // Venda operada por um funcionário presente — a verificação de
          // idade acontece por ele, não precisa de checkbox redundante aqui.
          confirmacaoMaioridade: true,
        });
        setQuantidades({});
        setCarrinhoAberto(false);
        if (formaPagamento === 'pix') {
          router.push(`/venda/${venda.id}/pix`);
        } else {
          router.push(`/venda/${venda.id}/recibo`);
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao registrar a venda.');
      }
    });
  }

  const carrinhoConteudo = (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold">Carrinho</h2>
      {itensCarrinho.length === 0 ? (
        <p className="text-sm text-muted">Nenhum item selecionado.</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
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
      <div className="flex justify-between border-t border-border pt-3 font-semibold">
        <span>Total</span>
        <span>R$ {total.toFixed(2)}</span>
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || itensCarrinho.length === 0}
          onClick={() => finalizarVenda('dinheiro')}
        >
          Finalizar — Dinheiro
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isPending || itensCarrinho.length === 0}
          onClick={() => finalizarVenda('cartao')}
        >
          Finalizar — Cartão
        </Button>
        <Button
          type="button"
          disabled={isPending || itensCarrinho.length === 0}
          onClick={() => finalizarVenda('pix')}
        >
          Finalizar — PIX
        </Button>
      </div>
    </div>
  );

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
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">{categoria}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {itens.map((produto) => {
                const esgotado = produto.estoque === 0;
                const noLimite =
                  produto.estoque !== null && (quantidades[produto.id] ?? 0) >= produto.estoque;
                return (
                  <div
                    key={produto.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <div>
                      <p className="text-sm">{produto.nome}</p>
                      <p className="text-xs text-muted">
                        R$ {produto.preco.toFixed(2)}
                        {esgotado && <span className="text-danger"> · Esgotado</span>}
                        {!esgotado && produto.estoque !== null && (
                          <span> · {produto.estoque} em estoque</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto, -1)}
                        className="w-11 h-11 rounded-lg border border-border text-lg hover:bg-surface-muted"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm">{quantidades[produto.id] ?? 0}</span>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(produto, 1)}
                        disabled={esgotado || noLimite}
                        className="w-11 h-11 rounded-lg border border-border text-lg hover:bg-surface-muted disabled:opacity-30 disabled:pointer-events-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Card className="hidden lg:block sticky top-4">{carrinhoConteudo}</Card>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface p-3 flex items-center justify-between shadow-lg">
        <div>
          <p className="text-xs text-muted">{itensCarrinho.length} item(ns)</p>
          <p className="font-semibold">R$ {total.toFixed(2)}</p>
        </div>
        <Button type="button" onClick={() => setCarrinhoAberto(true)} disabled={itensCarrinho.length === 0}>
          Ver carrinho
        </Button>
      </div>

      {carrinhoAberto && (
        <div
          className="lg:hidden fixed inset-0 z-30 flex flex-col justify-end bg-black/40"
          onClick={() => setCarrinhoAberto(false)}
        >
          <div
            className="bg-surface rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {carrinhoConteudo}
          </div>
        </div>
      )}

      <div className="lg:hidden h-20" aria-hidden />
    </div>
  );
}
