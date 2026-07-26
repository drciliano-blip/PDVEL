'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CAIXA_ATIVO_COOKIE } from '@/lib/session';

export async function setCaixaAtivoAction(caixaId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CAIXA_ATIVO_COOKIE, caixaId, { path: '/' });
  revalidatePath('/caixa');
  revalidatePath('/venda');
}

export async function limparCaixaAtivoAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CAIXA_ATIVO_COOKIE);
  revalidatePath('/caixa');
  revalidatePath('/venda');
}
