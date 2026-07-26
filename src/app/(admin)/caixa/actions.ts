'use server';

import { revalidatePath } from 'next/cache';
import { abrirCaixa, fecharCaixa } from '@/lib/data/caixas';
import { cancelarVenda } from '@/lib/data/vendas';

export async function abrirCaixaAction(formData: FormData): Promise<void> {
  const eventoId = String(formData.get('eventoId') ?? '');
  const operador = String(formData.get('operador') ?? '').trim();
  const valorAbertura = Number(formData.get('valorAbertura'));

  if (!eventoId || !operador || !Number.isFinite(valorAbertura) || valorAbertura < 0) {
    throw new Error('Preencha operador e valor de abertura válidos.');
  }

  await abrirCaixa(eventoId, operador, valorAbertura);
  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function fecharCaixaAction(formData: FormData): Promise<void> {
  const caixaId = String(formData.get('caixaId') ?? '');
  const valorFechamento = Number(formData.get('valorFechamento'));

  if (!caixaId || !Number.isFinite(valorFechamento) || valorFechamento < 0) {
    throw new Error('Informe um valor de fechamento válido.');
  }

  await fecharCaixa(caixaId, valorFechamento);
  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function cancelarVendaAction(vendaId: string, operador: string): Promise<void> {
  await cancelarVenda(vendaId, operador);
  revalidatePath('/caixa');
  revalidatePath('/relatorios');
}
