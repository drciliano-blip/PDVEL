import { supabase } from '@/lib/supabase/client';
import { getProduto } from './produtos';
import type { ContagemEstoque } from './types';

interface ContagemRow {
  id: string;
  caixa_id: string;
  produto_id: string;
  categoria: string;
  quantidade_esperada: number;
  quantidade_contada: number;
  diferenca: number;
  criado_em: string;
}

function rowToContagem(row: ContagemRow): ContagemEstoque {
  return {
    id: row.id,
    caixaId: row.caixa_id,
    produtoId: row.produto_id,
    categoria: row.categoria,
    quantidadeEsperada: row.quantidade_esperada,
    quantidadeContada: row.quantidade_contada,
    diferenca: row.diferenca,
    criadoEm: row.criado_em,
  };
}

export async function registrarContagemEstoque(
  caixaId: string,
  itens: { produtoId: string; quantidadeContada: number }[]
): Promise<ContagemEstoque[]> {
  const rows = [];
  for (const item of itens) {
    const produto = await getProduto(item.produtoId);
    if (!produto || produto.estoque === null) continue;
    rows.push({
      caixa_id: caixaId,
      produto_id: item.produtoId,
      categoria: produto.categoria,
      quantidade_esperada: produto.estoque,
      quantidade_contada: item.quantidadeContada,
      diferenca: item.quantidadeContada - produto.estoque,
    });
  }
  if (rows.length === 0) return [];

  const { data, error } = await supabase.from('contagens_estoque').insert(rows).select('*');
  if (error) throw error;
  return (data as ContagemRow[]).map(rowToContagem);
}

export async function listContagensPorCaixa(caixaId: string): Promise<ContagemEstoque[]> {
  const { data, error } = await supabase
    .from('contagens_estoque')
    .select('*')
    .eq('caixa_id', caixaId)
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data as ContagemRow[]).map(rowToContagem);
}
