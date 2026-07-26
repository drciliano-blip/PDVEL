'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { abrirCaixa, fecharCaixa, getCaixa } from '@/lib/data/caixas';
import { cancelarVenda } from '@/lib/data/vendas';
import { registrarContagemEstoque } from '@/lib/data/contagens';
import { CAIXA_ATIVO_COOKIE } from '@/lib/session';

export async function abrirCaixaAction(formData: FormData): Promise<void> {
  const eventoId = String(formData.get('eventoId') ?? '');
  const operador = String(formData.get('operador') ?? '').trim();
  const valorAbertura = Number(formData.get('valorAbertura'));

  if (!eventoId || !operador || !Number.isFinite(valorAbertura) || valorAbertura < 0) {
    throw new Error('Preencha operador e valor de abertura válidos.');
  }

  const caixa = await abrirCaixa(eventoId, operador, valorAbertura);

  const cookieStore = await cookies();
  cookieStore.set(CAIXA_ATIVO_COOKIE, caixa.id, { path: '/' });

  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function fecharCaixaComContagemAction(
  caixaId: string,
  formData: FormData
): Promise<void> {
  const valorFechamento = Number(formData.get('valorFechamento'));
  if (!Number.isFinite(valorFechamento) || valorFechamento < 0) {
    throw new Error('Informe um valor de fechamento válido.');
  }

  const contagens: { produtoId: string; quantidadeContada: number }[] = [];
  for (const [chave, valor] of formData.entries()) {
    if (!chave.startsWith('contagem_')) continue;
    const quantidade = Number(valor);
    if (!Number.isFinite(quantidade)) continue;
    contagens.push({ produtoId: chave.replace('contagem_', ''), quantidadeContada: quantidade });
  }
  if (contagens.length > 0) {
    await registrarContagemEstoque(caixaId, contagens);
  }

  await fecharCaixa(caixaId, valorFechamento);

  const cookieStore = await cookies();
  if (cookieStore.get(CAIXA_ATIVO_COOKIE)?.value === caixaId) {
    cookieStore.delete(CAIXA_ATIVO_COOKIE);
  }

  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function usarCaixaAction(caixaId: string): Promise<void> {
  const caixa = await getCaixa(caixaId);
  if (!caixa || caixa.status !== 'aberto') {
    throw new Error('Esse caixa não está mais aberto.');
  }
  const cookieStore = await cookies();
  cookieStore.set(CAIXA_ATIVO_COOKIE, caixaId, { path: '/' });
  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function soltarCaixaAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CAIXA_ATIVO_COOKIE);
  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function cancelarVendaAction(vendaId: string, operador: string): Promise<void> {
  await cancelarVenda(vendaId, operador);
  revalidatePath('/caixa');
  revalidatePath('/relatorios');
}
