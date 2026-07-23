import { store, nextId } from './store';
import type { FormaPagamento, Venda, VendaItem } from './types';

export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  precoUnit: number;
  quantidade: number;
}

function gerarPixPayloadFake(vendaId: string, total: number): string {
  // Payload fictício só para renderizar um QR na tela — sem relação com o padrão real do Bacen/Asaas.
  return `PDV-FAKE-PIX|venda=${vendaId}|valor=${total.toFixed(2)}`;
}

export async function criarVenda(params: {
  eventoId: string;
  caixaId: string;
  clienteId: string;
  convidadoId?: string | null;
  itens: ItemCarrinho[];
  formaPagamento: FormaPagamento;
}): Promise<Venda> {
  const total = params.itens.reduce((sum, i) => sum + i.precoUnit * i.quantidade, 0);
  const agora = new Date().toISOString();
  const id = nextId('venda');

  const venda: Venda = {
    id,
    eventoId: params.eventoId,
    caixaId: params.caixaId,
    clienteId: params.clienteId,
    convidadoId: params.convidadoId ?? null,
    total,
    formaPagamento: params.formaPagamento,
    statusPagamento: params.formaPagamento === 'dinheiro' ? 'pago' : 'pendente',
    pixPayloadFake: params.formaPagamento === 'pix' ? gerarPixPayloadFake(id, total) : null,
    criadoEm: agora,
    pagoEm: params.formaPagamento === 'dinheiro' ? agora : null,
  };
  store.vendas.push(venda);

  for (const item of params.itens) {
    const vendaItem: VendaItem = {
      id: nextId('item'),
      vendaId: venda.id,
      produtoId: item.produtoId,
      nome: item.nome,
      precoUnit: item.precoUnit,
      quantidade: item.quantidade,
      subtotal: item.precoUnit * item.quantidade,
    };
    store.vendaItens.push(vendaItem);
  }

  return venda;
}

/**
 * Fica isolado num único ponto porque é aqui que, na integração real, o
 * webhook `PAYMENT_RECEIVED` do Asaas vai bater em vez do clique do usuário.
 */
export async function confirmarPagamento(vendaId: string): Promise<void> {
  const venda = store.vendas.find((v) => v.id === vendaId);
  if (!venda || venda.statusPagamento === 'pago') return;
  venda.statusPagamento = 'pago';
  venda.pagoEm = new Date().toISOString();
}

export async function getVenda(id: string): Promise<Venda | undefined> {
  return store.vendas.find((v) => v.id === id);
}

export async function listItensPorVenda(vendaId: string): Promise<VendaItem[]> {
  return store.vendaItens.filter((i) => i.vendaId === vendaId);
}

export async function listVendasPorCliente(clienteId: string): Promise<Venda[]> {
  return store.vendas.filter((v) => v.clienteId === clienteId);
}
