import { supabase } from '@/lib/supabase/client';
import type { Cliente, StatusOnboardingAsaas } from './types';

interface ClienteRow {
  id: string;
  nome: string;
  comissao_percentual: number;
  asaas_subconta_id: string | null;
  asaas_wallet_id: string | null;
  asaas_status_onboarding: StatusOnboardingAsaas;
}

function rowToCliente(row: ClienteRow): Cliente {
  return {
    id: row.id,
    nome: row.nome,
    comissaoPercentual: row.comissao_percentual,
    asaasSubcontaId: row.asaas_subconta_id,
    asaasWalletId: row.asaas_wallet_id,
    asaasStatusOnboarding: row.asaas_status_onboarding,
  };
}

export async function listClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase.from('clientes').select('*').order('nome');
  if (error) throw error;
  return (data as ClienteRow[]).map(rowToCliente);
}

export async function getCliente(id: string): Promise<Cliente | undefined> {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToCliente(data as ClienteRow) : undefined;
}

export async function createCliente(input: {
  nome: string;
  comissaoPercentual: number;
}): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert({ nome: input.nome, comissao_percentual: input.comissaoPercentual })
    .select('*')
    .single();
  if (error) throw error;
  return rowToCliente(data as ClienteRow);
}

export async function salvarSubcontaAsaas(
  clienteId: string,
  input: { asaasSubcontaId: string; asaasWalletId: string; asaasStatusOnboarding: StatusOnboardingAsaas }
): Promise<void> {
  const { error } = await supabase
    .from('clientes')
    .update({
      asaas_subconta_id: input.asaasSubcontaId,
      asaas_wallet_id: input.asaasWalletId,
      asaas_status_onboarding: input.asaasStatusOnboarding,
    })
    .eq('id', clienteId);
  if (error) throw error;
}
