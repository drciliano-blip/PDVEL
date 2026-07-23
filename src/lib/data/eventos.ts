import { store } from './store';
import type { Evento } from './types';

export async function listEventosByCliente(clienteId: string): Promise<Evento[]> {
  return store.eventos.filter((e) => e.clienteId === clienteId);
}

export async function getEvento(id: string): Promise<Evento | undefined> {
  return store.eventos.find((e) => e.id === id);
}
