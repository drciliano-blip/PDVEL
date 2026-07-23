import { store } from './store';
import type { Cliente } from './types';

export async function listClientes(): Promise<Cliente[]> {
  return store.clientes;
}

export async function getCliente(id: string): Promise<Cliente | undefined> {
  return store.clientes.find((c) => c.id === id);
}
