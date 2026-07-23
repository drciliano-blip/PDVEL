'use server';

import { buscarConvidadoPorCpf, buscarConvidadoPorCartao, criarConvidado } from '@/lib/data/convidados';
import type { Convidado } from '@/lib/data/types';

export async function buscarConvidadoAction(params: {
  clienteId: string;
  cpf?: string;
  numeroCartaoConsumo?: string;
}): Promise<Convidado | null> {
  if (params.cpf) {
    const porCpf = await buscarConvidadoPorCpf(params.clienteId, params.cpf);
    if (porCpf) return porCpf;
  }
  if (params.numeroCartaoConsumo) {
    const porCartao = await buscarConvidadoPorCartao(params.clienteId, params.numeroCartaoConsumo);
    if (porCartao) return porCartao;
  }
  return null;
}

export async function criarConvidadoAction(params: {
  clienteId: string;
  eventoId: string;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  numeroCartaoConsumo: string | null;
  consentimentoLgpd: boolean;
}): Promise<Convidado> {
  return criarConvidado(params);
}
