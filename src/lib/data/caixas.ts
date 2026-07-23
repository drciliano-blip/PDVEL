import { store, nextId } from './store';
import type { Caixa } from './types';

export async function getCaixaAbertoPorEvento(eventoId: string): Promise<Caixa | undefined> {
  return store.caixas.find((c) => c.eventoId === eventoId && c.status === 'aberto');
}

export async function listCaixasPorEvento(eventoId: string): Promise<Caixa[]> {
  return store.caixas
    .filter((c) => c.eventoId === eventoId)
    .sort((a, b) => b.abertoEm.localeCompare(a.abertoEm));
}

export async function abrirCaixa(
  eventoId: string,
  operador: string,
  valorAbertura: number
): Promise<Caixa> {
  const existente = await getCaixaAbertoPorEvento(eventoId);
  if (existente) {
    throw new Error('Já existe um caixa aberto para este evento.');
  }
  const caixa: Caixa = {
    id: nextId('caixa'),
    eventoId,
    operador,
    status: 'aberto',
    valorAbertura,
    valorFechamento: null,
    abertoEm: new Date().toISOString(),
    fechadoEm: null,
  };
  store.caixas.push(caixa);
  return caixa;
}

export async function fecharCaixa(caixaId: string, valorFechamento: number): Promise<void> {
  const caixa = store.caixas.find((c) => c.id === caixaId);
  if (!caixa) return;
  caixa.status = 'fechado';
  caixa.valorFechamento = valorFechamento;
  caixa.fechadoEm = new Date().toISOString();
}
