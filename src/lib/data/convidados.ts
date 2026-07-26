import { supabase } from '@/lib/supabase/client';
import type { Convidado } from './types';

interface ConvidadoRow {
  id: string;
  cliente_id: string;
  evento_id: string;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  numero_cartao_consumo: string | null;
  consentimento_lgpd_em: string | null;
  criado_em: string;
}

function rowToConvidado(row: ConvidadoRow): Convidado {
  return {
    id: row.id,
    clienteId: row.cliente_id,
    eventoId: row.evento_id,
    nome: row.nome,
    cpf: row.cpf,
    telefone: row.telefone,
    email: row.email,
    numeroCartaoConsumo: row.numero_cartao_consumo,
    consentimentoLgpdEm: row.consentimento_lgpd_em,
    criadoEm: row.criado_em,
  };
}

function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export async function buscarConvidadoPorCpf(
  clienteId: string,
  cpf: string
): Promise<Convidado | undefined> {
  const { data, error } = await supabase
    .from('convidados')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('cpf', normalizarCpf(cpf))
    .maybeSingle();
  if (error) throw error;
  return data ? rowToConvidado(data as ConvidadoRow) : undefined;
}

export async function buscarConvidadoPorCartao(
  clienteId: string,
  numeroCartaoConsumo: string
): Promise<Convidado | undefined> {
  const { data, error } = await supabase
    .from('convidados')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('numero_cartao_consumo', numeroCartaoConsumo)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToConvidado(data as ConvidadoRow) : undefined;
}

export async function getConvidado(id: string): Promise<Convidado | undefined> {
  const { data, error } = await supabase.from('convidados').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToConvidado(data as ConvidadoRow) : undefined;
}

export async function criarConvidado(input: {
  clienteId: string;
  eventoId: string;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  numeroCartaoConsumo: string | null;
  consentimentoLgpd: boolean;
}): Promise<Convidado> {
  const contemDadoPessoal = !!(input.cpf || input.telefone || input.email);
  if (contemDadoPessoal && !input.consentimentoLgpd) {
    throw new Error('É necessário o consentimento do titular para armazenar CPF, telefone ou e-mail.');
  }

  const { data, error } = await supabase
    .from('convidados')
    .insert({
      cliente_id: input.clienteId,
      evento_id: input.eventoId,
      nome: input.nome,
      cpf: input.cpf ? normalizarCpf(input.cpf) : null,
      telefone: input.telefone,
      email: input.email,
      numero_cartao_consumo: input.numeroCartaoConsumo,
      consentimento_lgpd_em: input.consentimentoLgpd ? new Date().toISOString() : null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return rowToConvidado(data as ConvidadoRow);
}
