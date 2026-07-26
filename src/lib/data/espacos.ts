import { supabase } from '@/lib/supabase/client';
import type { Espaco } from './types';

interface EspacoRow {
  id: string;
  nome: string;
}

function rowToEspaco(row: EspacoRow): Espaco {
  return { id: row.id, nome: row.nome };
}

export async function listEspacos(): Promise<Espaco[]> {
  const { data, error } = await supabase.from('espacos').select('id, nome').order('nome');
  if (error) throw error;
  return (data as EspacoRow[]).map(rowToEspaco);
}

export async function createEspaco(nome: string): Promise<Espaco> {
  const { data, error } = await supabase.from('espacos').insert({ nome }).select('id, nome').single();
  if (error) throw error;
  return rowToEspaco(data as EspacoRow);
}
