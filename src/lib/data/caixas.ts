import { supabase } from '@/lib/supabase/client';
import type { Caixa } from './types';

interface CaixaRow {
  id: string;
  evento_id: string;
  operador: string;
  status: 'aberto' | 'fechado';
  valor_abertura: number;
  valor_fechamento: number | null;
  aberto_em: string;
  fechado_em: string | null;
}

function rowToCaixa(row: CaixaRow): Caixa {
  return {
    id: row.id,
    eventoId: row.evento_id,
    operador: row.operador,
    status: row.status,
    valorAbertura: row.valor_abertura,
    valorFechamento: row.valor_fechamento,
    abertoEm: row.aberto_em,
    fechadoEm: row.fechado_em,
  };
}

export async function getCaixa(id: string): Promise<Caixa | undefined> {
  const { data, error } = await supabase.from('caixas').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToCaixa(data as CaixaRow) : undefined;
}

/**
 * Usado pelo totem (kiosk único por evento): pega qualquer caixa aberto,
 * já que não há como o convidado escolher "qual" caixa é o dele.
 */
export async function getCaixaAbertoPorEvento(eventoId: string): Promise<Caixa | undefined> {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('status', 'aberto')
    .order('aberto_em', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCaixa(data as CaixaRow) : undefined;
}

export async function listCaixasAbertosPorEvento(eventoId: string): Promise<Caixa[]> {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('status', 'aberto')
    .order('aberto_em', { ascending: false });
  if (error) throw error;
  return (data as CaixaRow[]).map(rowToCaixa);
}

export async function listCaixasPorEvento(eventoId: string): Promise<Caixa[]> {
  const { data, error } = await supabase
    .from('caixas')
    .select('*')
    .eq('evento_id', eventoId)
    .order('aberto_em', { ascending: false });
  if (error) throw error;
  return (data as CaixaRow[]).map(rowToCaixa);
}

/**
 * Sem trava de "um caixa por evento" — vários operadores (totem, caixas
 * volantes, tablets) podem vender ao mesmo tempo no mesmo evento.
 */
export async function abrirCaixa(
  eventoId: string,
  operador: string,
  valorAbertura: number
): Promise<Caixa> {
  const { data, error } = await supabase
    .from('caixas')
    .insert({ evento_id: eventoId, operador, status: 'aberto', valor_abertura: valorAbertura })
    .select('*')
    .single();
  if (error) throw error;
  return rowToCaixa(data as CaixaRow);
}

export async function fecharCaixa(caixaId: string, valorFechamento: number): Promise<void> {
  const { error } = await supabase
    .from('caixas')
    .update({
      status: 'fechado',
      valor_fechamento: valorFechamento,
      fechado_em: new Date().toISOString(),
    })
    .eq('id', caixaId);
  if (error) throw error;
}
