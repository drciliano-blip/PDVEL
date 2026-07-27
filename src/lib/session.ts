import { cookies } from 'next/headers';
import { listClientes } from '@/lib/data/clientes';
import { getCaixa } from '@/lib/data/caixas';
import { getEvento, listEventosByCliente } from '@/lib/data/eventos';

export const CLIENTE_ATIVO_COOKIE = 'clienteAtivoId';
export const CAIXA_ATIVO_COOKIE = 'caixaAtivoId';
export const EVENTO_ATIVO_COOKIE = 'eventoAtivoId';

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

/**
 * "Último evento visitado" — só usada pelas rotas antigas (redirects) e
 * pelo botão "Entrar" pra saber pra onde mandar o operador. As páginas do
 * hub (`/eventos/[eventoId]/...`) usam o eventoId da própria URL, nunca
 * este cookie.
 */
export async function getEventoAtivoId(clienteId: string): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(EVENTO_ATIVO_COOKIE)?.value;
  if (!cookieId) return null;
  const evento = await getEvento(cookieId);
  if (!evento || evento.clienteId !== clienteId) return null;
  return evento.id;
}

export async function resolveEventoParaRedirect(clienteId: string): Promise<string | null> {
  const ativo = await getEventoAtivoId(clienteId);
  if (ativo) return ativo;
  const eventos = await listEventosByCliente(clienteId);
  return eventos[0]?.id ?? null;
}
