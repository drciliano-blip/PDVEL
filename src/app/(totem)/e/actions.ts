'use server';

import { getVenda, listItensPorVenda } from '@/lib/data/vendas';
import { listFichasPorVenda } from '@/lib/data/fichas';
import type { Venda, VendaItem, Ficha } from '@/lib/data/types';

export interface CarteiraVenda {
  venda: Venda;
  itens: VendaItem[];
  fichas: Ficha[];
}

export async function buscarCarteiraAction(
  eventoId: string,
  vendaIds: string[]
): Promise<CarteiraVenda[]> {
  const resultado: CarteiraVenda[] = [];
  for (const vendaId of vendaIds) {
    const venda = await getVenda(vendaId);
    if (!venda || venda.eventoId !== eventoId) continue;
    const [itens, fichas] = await Promise.all([
      listItensPorVenda(venda.id),
      listFichasPorVenda(venda.id),
    ]);
    resultado.push({ venda, itens, fichas });
  }
  return resultado;
}
