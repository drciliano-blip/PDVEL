import { supabase } from '@/lib/supabase/client';
import type { Produto } from './types';

interface ProdutoRow {
  id: string;
  cliente_id: string;
  nome: string;
  categoria: string;
  preco: number;
  ativo: boolean;
  estoque: number | null;
  alcoolico: boolean;
}

function rowToProduto(row: ProdutoRow): Produto {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    nome: row.nome,
    categoria: row.categoria,
    preco: row.preco,
    ativo: row.ativo,
    estoque: row.estoque,
    alcoolico: row.alcoolico,
  };
}

export async function listProdutosByCliente(clienteId: string): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('categoria');
  if (error) throw error;
  return (data as ProdutoRow[]).map(rowToProduto);
}

export async function getProduto(id: string): Promise<Produto | undefined> {
  const { data, error } = await supabase.from('produtos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToProduto(data as ProdutoRow) : undefined;
}

/**
 * Delta negativo para dar baixa numa venda, positivo para devolver
 * (ex.: cancelamento). Produtos com `estoque: null` não têm controle e não são afetados.
 */
export async function ajustarEstoque(id: string, delta: number): Promise<void> {
  const produto = await getProduto(id);
  if (!produto || produto.estoque === null) return;
  const novoEstoque = Math.max(0, produto.estoque + delta);
  const { error } = await supabase.from('produtos').update({ estoque: novoEstoque }).eq('id', id);
  if (error) throw error;
}

export async function createProduto(input: Omit<Produto, 'id'>): Promise<Produto> {
  const { data, error } = await supabase
    .from('produtos')
    .insert({
      cliente_id: input.clienteId,
      nome: input.nome,
      categoria: input.categoria,
      preco: input.preco,
      ativo: input.ativo,
      estoque: input.estoque,
      alcoolico: input.alcoolico,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToProduto(data as ProdutoRow);
}

export async function toggleProdutoAtivo(id: string): Promise<void> {
  const produto = await getProduto(id);
  if (!produto) return;
  const { error } = await supabase.from('produtos').update({ ativo: !produto.ativo }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduto(id: string): Promise<void> {
  const { error } = await supabase.from('produtos').delete().eq('id', id);
  if (error) {
    if (error.code === '23503') {
      throw new Error(
        'Este produto já foi vendido e não pode ser excluído — desative-o em vez de excluir.'
      );
    }
    throw error;
  }
}
