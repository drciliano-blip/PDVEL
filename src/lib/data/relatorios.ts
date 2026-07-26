import { supabase } from '@/lib/supabase/client';

export interface RelatorioVendas {
  totalGeral: number;
  porEvento: { eventoId: string; eventoNome: string; total: number; quantidadeVendas: number }[];
  porFormaPagamento: { formaPagamento: string; total: number; quantidadeVendas: number }[];
  porProduto: { produtoId: string; nome: string; quantidade: number; total: number }[];
  porOperador: { operador: string; total: number; quantidadeVendas: number }[];
}

interface VendaRow {
  id: string;
  evento_id: string;
  caixa_id: string;
  forma_pagamento: string;
  total: number;
}

export async function gerarRelatorioVendas(clienteId: string): Promise<RelatorioVendas> {
  const { data: vendasData, error: vendasError } = await supabase
    .from('vendas')
    .select('id, evento_id, caixa_id, forma_pagamento, total')
    .eq('cliente_id', clienteId)
    .eq('status_pagamento', 'pago');
  if (vendasError) throw vendasError;
  const vendas = vendasData as VendaRow[];

  const totalGeral = vendas.reduce((sum, v) => sum + v.total, 0);

  if (vendas.length === 0) {
    return { totalGeral: 0, porEvento: [], porFormaPagamento: [], porProduto: [], porOperador: [] };
  }

  const eventoIds = [...new Set(vendas.map((v) => v.evento_id))];
  const caixaIds = [...new Set(vendas.map((v) => v.caixa_id))];
  const vendaIds = vendas.map((v) => v.id);

  const [{ data: eventosData }, { data: caixasData }, { data: itensData }] = await Promise.all([
    supabase.from('eventos').select('id, nome').in('id', eventoIds),
    supabase.from('caixas').select('id, operador').in('id', caixaIds),
    supabase.from('venda_itens').select('venda_id, produto_id, nome, quantidade, subtotal').in('venda_id', vendaIds),
  ]);

  const eventoNomeMap = new Map((eventosData as { id: string; nome: string }[]).map((e) => [e.id, e.nome]));
  const caixaOperadorMap = new Map(
    (caixasData as { id: string; operador: string }[]).map((c) => [c.id, c.operador])
  );

  const porEventoMap = new Map<string, { eventoNome: string; total: number; quantidadeVendas: number }>();
  const porFormaMap = new Map<string, { total: number; quantidadeVendas: number }>();
  const porOperadorMap = new Map<string, { total: number; quantidadeVendas: number }>();

  for (const venda of vendas) {
    const nomeEvento = eventoNomeMap.get(venda.evento_id) ?? venda.evento_id;
    const atualEvento = porEventoMap.get(venda.evento_id) ?? {
      eventoNome: nomeEvento,
      total: 0,
      quantidadeVendas: 0,
    };
    atualEvento.total += venda.total;
    atualEvento.quantidadeVendas += 1;
    porEventoMap.set(venda.evento_id, atualEvento);

    const atualForma = porFormaMap.get(venda.forma_pagamento) ?? { total: 0, quantidadeVendas: 0 };
    atualForma.total += venda.total;
    atualForma.quantidadeVendas += 1;
    porFormaMap.set(venda.forma_pagamento, atualForma);

    const operador = caixaOperadorMap.get(venda.caixa_id) ?? 'Desconhecido';
    const atualOperador = porOperadorMap.get(operador) ?? { total: 0, quantidadeVendas: 0 };
    atualOperador.total += venda.total;
    atualOperador.quantidadeVendas += 1;
    porOperadorMap.set(operador, atualOperador);
  }

  const porProdutoMap = new Map<string, { nome: string; quantidade: number; total: number }>();
  for (const item of itensData as { produto_id: string; nome: string; quantidade: number; subtotal: number }[]) {
    const atual = porProdutoMap.get(item.produto_id) ?? { nome: item.nome, quantidade: 0, total: 0 };
    atual.quantidade += item.quantidade;
    atual.total += item.subtotal;
    porProdutoMap.set(item.produto_id, atual);
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
