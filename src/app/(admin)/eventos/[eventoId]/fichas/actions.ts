'use server';

import { revalidatePath } from 'next/cache';
import { getProduto } from '@/lib/data/produtos';
import { getEvento } from '@/lib/data/eventos';
import { criarVenda } from '@/lib/data/vendas';
import { cancelarFicha } from '@/lib/data/fichas';

export async function emitirFichaAction(params: {
  eventoId: string;
  caixaId: string;
  clienteId: string;
  produtoId: string;
  quantidade: number;
  operador: string;
  cortesia: boolean;
}): Promise<void> {
  if (!params.operador.trim()) {
    throw new Error('Informe quem está emitindo a ficha.');
  }
  if (!Number.isFinite(params.quantidade) || params.quantidade <= 0) {
    throw new Error('Informe uma quantidade válida.');
  }

  const evento = await getEvento(params.eventoId);
  if (!evento) throw new Error('Evento não encontrado.');
  if (!evento.fichasHabilitadas) {
    throw new Error('Habilite a impressão de fichas para este evento antes de emitir.');
  }

  const produto = await getProduto(params.produtoId);
  if (!produto) throw new Error('Produto não encontrado.');

  await criarVenda({
    eventoId: params.eventoId,
    caixaId: params.caixaId,
    clienteId: params.clienteId,
    itens: [
      {
        produtoId: produto.id,
        nome: produto.nome,
        precoUnit: produto.preco,
        quantidade: params.quantidade,
      },
    ],
    formaPagamento: 'dinheiro',
    confirmacaoMaioridade: true,
    cortesia: params.cortesia,
  });

  revalidatePath('/eventos/[eventoId]/fichas', 'page');
  revalidatePath('/eventos/[eventoId]', 'page');
  if (!params.cortesia) {
    revalidatePath('/eventos/[eventoId]/relatorios', 'page');
    revalidatePath('/relatorios');
  }
}

export async function cancelarFichaAction(
  fichaId: string,
  canceladoPor: string,
  motivo: string
): Promise<boolean> {
  if (!canceladoPor.trim() || !motivo.trim()) {
    throw new Error('Informe quem está cancelando e o motivo.');
  }
  const sucesso = await cancelarFicha(fichaId, canceladoPor.trim(), motivo.trim());
  revalidatePath('/eventos/[eventoId]/fichas', 'page');
  return sucesso;
}
