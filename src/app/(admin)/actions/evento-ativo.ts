'use server';

import { cookies } from 'next/headers';
import { EVENTO_ATIVO_COOKIE } from '@/lib/session';

export async function setEventoAtivoAction(eventoId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(EVENTO_ATIVO_COOKIE, eventoId, { path: '/' });
}
