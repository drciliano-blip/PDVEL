import { store, nextId } from './store';
import type { Convidado } from './types';

function normalizarCpf(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export async function buscarConvidadoPorCpf(
  clienteId: string,
  cpf: string
): Promise<Convidado | undefined> {
  const cpfNormalizado = normalizarCpf(cpf);
  return store.convidados.find((c) => c.clienteId === clienteId && c.cpf === cpfNormalizado);
}

export async function buscarConvidadoPorCartao(
  clienteId: string,
  numeroCartaoConsumo: string
): Promise<Convidado | undefined> {
  return store.convidados.find(
    (c) => c.clienteId === clienteId && c.numeroCartaoConsumo === numeroCartaoConsumo
  );
}

export async function getConvidado(id: string): Promise<Convidado | undefined> {
  return store.convidados.find((c) => c.id === id);
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
  const convidado: Convidado = {
    id: nextId('convidado'),
    clienteId: input.clienteId,
    eventoId: input.eventoId,
    nome: input.nome,
    cpf: input.cpf ? normalizarCpf(input.cpf) : null,
    telefone: input.telefone,
    email: input.email,
    numeroCartaoConsumo: input.numeroCartaoConsumo,
    consentimentoLgpdEm: input.consentimentoLgpd ? new Date().toISOString() : null,
    criadoEm: new Date().toISOString(),
  };
  store.convidados.push(convidado);
  return convidado;
}
