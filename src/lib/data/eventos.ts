import { supabase } from '@/lib/supabase/client';
import type { Evento } from './types';

interface EventoRow {
  id: string;
  cliente_id: string;
  nome: string;
  data: string;
}

function rowToEvento(row: EventoRow): Evento {
  return { id: row.id, clienteId: row.cliente_id, nome: row.nome, data: row.data };
}

export async function listEventosByCliente(clienteId: string): Promise<Evento[]> {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('data');
  if (error) throw error;
  return (data as EventoRow[]).map(rowToEvento);
}

export async function getEvento(id: string): Promise<Evento | undefined> {
  const { data, error } = await supabase.from('eventos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToEvento(data as EventoRow) : undefined;
}

export async function createEvento(input: {
  clienteId: string;
  nome: string;
  data: string;
}): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .insert({ cliente_id: input.clienteId, nome: input.nome, data: input.data })
    .select('*')
    .single();
  if (error) throw error;
  return rowToEvento(data as EventoRow);
}
