import { redirect } from 'next/navigation';
import { getClienteAtivoId, resolveEventoParaRedirect } from '@/lib/session';

export default async function VendaRedirect() {
  const clienteId = await getClienteAtivoId();
  if (!clienteId) redirect('/');
  const eventoId = await resolveEventoParaRedirect(clienteId);
  redirect(eventoId ? `/eventos/${eventoId}/venda` : '/');
}
