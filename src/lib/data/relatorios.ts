import { store } from './store';

export interface RelatorioVendas {
  totalGeral: number;
  porEvento: { eventoId: string; eventoNome: string; total: number; quantidadeVendas: number }[];
  porFormaPagamento: { formaPagamento: string; total: number; quantidadeVendas: number }[];
  porProduto: { produtoId: string; nome: string; quantidade: number; total: number }[];
  porOperador: { operador: string; total: number; quantidadeVendas: number }[];
}

export async function gerarRelatorioVendas(clienteId: string): Promise<RelatorioVendas> {
  const vendas = store.vendas.filter((v) => v.clienteId === clienteId && v.statusPagamento === 'pago');

  const totalGeral = vendas.reduce((sum, v) => sum + v.total, 0);

  const porEventoMap = new Map<string, { eventoNome: string; total: number; quantidadeVendas: number }>();
  for (const venda of vendas) {
    const evento = store.eventos.find((e) => e.id === venda.eventoId);
    const nome = evento?.nome ?? venda.eventoId;
    const atual = porEventoMap.get(venda.eventoId) ?? { eventoNome: nome, total: 0, quantidadeVendas: 0 };
    atual.total += venda.total;
    atual.quantidadeVendas += 1;
    porEventoMap.set(venda.eventoId, atual);
  }

  const porFormaMap = new Map<string, { total: number; quantidadeVendas: number }>();
  for (const venda of vendas) {
    const atual = porFormaMap.get(venda.formaPagamento) ?? { total: 0, quantidadeVendas: 0 };
    atual.total += venda.total;
    atual.quantidadeVendas += 1;
    porFormaMap.set(venda.formaPagamento, atual);
  }

  const porProdutoMap = new Map<string, { nome: string; quantidade: number; total: number }>();
  const vendaIds = new Set(vendas.map((v) => v.id));
  for (const item of store.vendaItens) {
    if (!vendaIds.has(item.vendaId)) continue;
    const atual = porProdutoMap.get(item.produtoId) ?? { nome: item.nome, quantidade: 0, total: 0 };
    atual.quantidade += item.quantidade;
    atual.total += item.subtotal;
    porProdutoMap.set(item.produtoId, atual);
  }

  const porOperadorMap = new Map<string, { total: number; quantidadeVendas: number }>();
  for (const venda of vendas) {
    const caixa = store.caixas.find((c) => c.id === venda.caixaId);
    const operador = caixa?.operador ?? 'Desconhecido';
    const atual = porOperadorMap.get(operador) ?? { total: 0, quantidadeVendas: 0 };
    atual.total += venda.total;
    atual.quantidadeVendas += 1;
    porOperadorMap.set(operador, atual);
  }

  return {
    totalGeral,
    porEvento: Array.from(porEventoMap.entries()).map(([eventoId, v]) => ({ eventoId, ...v })),
    porFormaPagamento: Array.from(porFormaMap.entries()).map(([formaPagamento, v]) => ({
      formaPagamento,
      ...v,
    })),
    porProduto: Array.from(porProdutoMap.entries()).map(([produtoId, v]) => ({ produtoId, ...v })),
    porOperador: Array.from(porOperadorMap.entries()).map(([operador, v]) => ({ operador, ...v })),
  };
}
