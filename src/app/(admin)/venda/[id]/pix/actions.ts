'use server';

import { revalidatePath } from 'next/cache';
import { confirmarPagamento } from '@/lib/data/vendas';

/**
 * No lugar desta action, a integração real vai ter o webhook do Asaas
 * (`PAYMENT_RECEIVED`) chamando `confirmarPagamento` sozinho.
 */
export async function confirmarPagamentoAction(vendaId: string): Promise<void> {
  await confirmarPagamento(vendaId);
  revalidatePath(`/venda/${vendaId}/pix`);
  revalidatePath('/relatorios');
}
