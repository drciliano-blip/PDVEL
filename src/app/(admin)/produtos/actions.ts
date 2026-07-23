'use server';

import { revalidatePath } from 'next/cache';
import { createProduto, deleteProduto, toggleProdutoAtivo } from '@/lib/data/produtos';
import { getClienteAtivoId } from '@/lib/session';

export async function createProdutoAction(formData: FormData): Promise<void> {
  const clienteId = await getClienteAtivoId();
  const nome = String(formData.get('nome') ?? '').trim();
  const categoria = String(formData.get('categoria') ?? '').trim();
  const preco = Number(formData.get('preco'));

  if (!nome || !categoria || !Number.isFinite(preco) || preco <= 0) {
    throw new Error('Preencha nome, categoria e um preço válido.');
  }

  await createProduto({ clienteId, nome, categoria, preco, ativo: true });
  revalidatePath('/produtos');
}

export async function toggleProdutoAtivoAction(id: string): Promise<void> {
  await toggleProdutoAtivo(id);
  revalidatePath('/produtos');
}

export async function deleteProdutoAction(id: string): Promise<void> {
  await deleteProduto(id);
  revalidatePath('/produtos');
}
