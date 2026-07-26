import { cookies } from 'next/headers';
import { listClientes } from '@/lib/data/clientes';

export const CLIENTE_ATIVO_COOKIE = 'clienteAtivoId';

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
