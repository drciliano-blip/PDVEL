'use server';

import { revalidatePath } from 'next/cache';
import { buscarFichaPorCodigo, resgatarFicha } from '@/lib/data/fichas';
import { getClienteAtivoId } from '@/lib/session';
import type { Ficha } from '@/lib/data/types';

export async function buscarFichaAction(codigo: string): Promise<Ficha | null> {
  const clienteId = await getClienteAtivoId();
  if (!clienteId) return null;
  const ficha = await buscarFichaPorCodigo(clienteId, codigo);
  return ficha ?? null;
}

export async function confirmarResgateAction(fichaId: string, operador: string): Promise<boolean> {
  const sucesso = await resgatarFicha(fichaId, operador);
  revalidatePath('/fichas/resgatar');
  return sucesso;
}
