import { cookies } from 'next/headers';
import { listClientes } from '@/lib/data/clientes';
import { getCaixa } from '@/lib/data/caixas';

export const CLIENTE_ATIVO_COOKIE = 'clienteAtivoId';
export const CAIXA_ATIVO_COOKIE = 'caixaAtivoId';

export async function getClienteAtivoId(): Promise<string | null> {
  const clientes = await listClientes();
  if (clientes.length === 0) return null;

  const cookieStore = await cookies();
  const cookieId = cookieStore.get(CLIENTE_ATIVO_COOKIE)?.value;
  if (cookieId && clientes.some((c) => c.id === cookieId)) {
    return cookieId;
  }
  return clientes[0].id;
}

/**
 * "Caixa deste aparelho" para um evento — cada totem/tablet/caixa volante
 * mantém o próprio caixa entre navegações, já que vários podem estar
 * abertos ao mesmo tempo no mesmo evento.
 */
export async function getCaixaAtivoId(eventoId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(CAIXA_ATIVO_COOKIE)?.value;
  if (!cookieId) return null;

  const caixa = await getCaixa(cookieId);
  if (!caixa || caixa.eventoId !== eventoId || caixa.status !== 'aberto') return null;
  return caixa.id;
}
