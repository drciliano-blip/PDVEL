import { store, nextId } from './store';
import type { Produto } from './types';

export async function listProdutosByCliente(clienteId: string): Promise<Produto[]> {
  return store.produtos.filter((p) => p.clienteId === clienteId);
}

export async function createProduto(input: Omit<Produto, 'id'>): Promise<Produto> {
  const produto: Produto = { id: nextId('prod'), ...input };
  store.produtos.push(produto);
  return produto;
}

export async function toggleProdutoAtivo(id: string): Promise<void> {
  const produto = store.produtos.find((p) => p.id === id);
  if (!produto) return;
  produto.ativo = !produto.ativo;
}

export async function deleteProduto(id: string): Promise<void> {
  store.produtos = store.produtos.filter((p) => p.id !== id);
}
