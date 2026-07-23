'use server';

import { revalidatePath } from 'next/cache';
import { criarVenda, type ItemCarrinho } from '@/lib/data/vendas';
import type { FormaPagamento } from '@/lib/data/types';

export async function criarVendaAction(params: {
  eventoId: string;
  caixaId: string;
  clienteId: string;
  convidadoId?: string | null;
  itens: ItemCarrinho[];
  formaPagamento: FormaPagamento;
}) {
  if (params.itens.length === 0) {
    throw new Error('O carrinho está vazio.');
  }
  const venda = await criarVenda(params);
  revalidatePath('/relatorios');
  return venda;
}
