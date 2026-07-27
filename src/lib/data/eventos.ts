import { supabase } from '@/lib/supabase/client';
import type { Evento, EventoComDetalhes, StatusCaixa } from './types';

interface EventoRow {
  id: string;
  cliente_id: string;
  espaco_id: string | null;
  nome: string;
  data: string;
  fichas_habilitadas: boolean;
}

interface EventoDetalheRow extends EventoRow {
  clientes: { nome: string } | null;
  espacos: { nome: string } | null;
  caixas: { status: StatusCaixa }[];
}

function rowToEvento(row: EventoRow): Evento {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    espacoId: row.espaco_id,
    nome: row.nome,
    data: row.data,
    fichasHabilitadas: row.fichas_habilitadas,
  };
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
  espacoId?: string | null;
  nome: string;
  data: string;
  fichasHabilitadas?: boolean;
}): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .insert({
      cliente_id: input.clienteId,
      espaco_id: input.espacoId ?? null,
      nome: input.nome,
      data: input.data,
      fichas_habilitadas: input.fichasHabilitadas ?? false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToEvento(data as EventoRow);
}

export async function toggleFichasHabilitadas(eventoId: string): Promise<void> {
  const evento = await getEvento(eventoId);
  if (!evento) return;
  const { error } = await supabase
    .from('eventos')
    .update({ fichas_habilitadas: !evento.fichasHabilitadas })
    .eq('id', eventoId);
  if (error) throw error;
}

export async function getEventoComDetalhes(id: string): Promise<EventoComDetalhes | undefined> {
  const { data, error } = await supabase
    .from('eventos')
    .select('*, clientes(nome), espacos(nome), caixas(status)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const row = data as EventoDetalheRow;
  return {
    ...rowToEvento(row),
    clienteNome: row.clientes?.nome ?? 'Desconhecido',
    espacoNome: row.espacos?.nome ?? null,
    statusCaixa: row.caixas.some((c) => c.status === 'aberto')
      ? 'aberto'
      : row.caixas.length > 0
        ? 'fechado'
        : null,
  };
}

export async function listTodosEventosComDetalhes(clienteId?: string): Promise<EventoComDetalhes[]> {
  let query = supabase
    .from('eventos')
    .select('*, clientes(nome), espacos(nome), caixas(status)')
    .order('data', { ascending: false });
  if (clienteId) query = query.eq('cliente_id', clienteId);
  const { data, error } = await query;
  if (error) throw error;

  return (data as EventoDetalheRow[]).map((row) => ({
    ...rowToEvento(row),
    clienteNome: row.clientes?.nome ?? 'Desconhecido',
    espacoNome: row.espacos?.nome ?? null,
    statusCaixa: row.caixas.some((c) => c.status === 'aberto')
      ? 'aberto'
      : row.caixas.length > 0
        ? 'fechado'
        : null,
  }));
}
