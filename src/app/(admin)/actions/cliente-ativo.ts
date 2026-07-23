'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { CLIENTE_ATIVO_COOKIE } from '@/lib/session';

export async function setClienteAtivoAction(clienteId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CLIENTE_ATIVO_COOKIE, clienteId, { path: '/' });
  revalidatePath('/', 'layout');
}
