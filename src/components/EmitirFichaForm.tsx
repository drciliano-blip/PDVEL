'use client';

import { useState, useTransition } from 'react';
import { emitirFichaAction } from '@/app/(admin)/eventos/[eventoId]/fichas/actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Produto } from '@/lib/data/types';

interface EmitirFichaFormProps {
  produtos: Produto[];
  eventoId: string;
  caixaId: string;
  clienteId: string;
  cortesia: boolean;
}

export function EmitirFichaForm({ produtos, eventoId, caixaId, clienteId, cortesia }: EmitirFichaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? '');
  const [quantidade, setQuantidade] = useState(1);
  const [operador, setOperador] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  function emitir() {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      try {
        await emitirFichaAction({
          eventoId,
          caixaId,
          clienteId,
          produtoId,
          quantidade,
          operador,
          cortesia,
        });
        setSucesso(true);
        setQuantidade(1);
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao emitir a ficha.');
      }
    });
  }

  if (produtos.length === 0) {
    return <p className="text-muted">Nenhum produto ativo no cardápio.</p>;
  }

  return (
    <Card className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Produto</label>
        <select
          value={produtoId}
          onChange={(e) => setProdutoId(e.target.value)}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
        >
          {produtos.map((produto) => (
            <option key={produto.id} value={produto.id}>
              {produto.nome} — R$ {produto.preco.toFixed(2)}
              {produto.alcoolico ? ' 🔞' : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Quantidade</label>
        <Input
          type="number"
          min="1"
          step="1"
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="w-28"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted">Emitido por</label>
        <Input value={operador} onChange={(e) => setOperador(e.target.value)} />
      </div>

      {erro && <p className="text-sm text-danger">{erro}</p>}
      {sucesso && <p className="text-sm text-success">Ficha(s) emitida(s) com sucesso!</p>}

      <Button type="button" disabled={isPending} onClick={emitir} className="w-fit">
        {cortesia ? 'Emitir cortesia' : 'Emitir ficha'}
      </Button>
    </Card>
  );
}
