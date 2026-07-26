import { randomUUID } from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { getProduto, ajustarEstoque } from './produtos';
import { getCliente } from './clientes';
import { getConvidado } from './convidados';
import { getEvento } from './eventos';
import { criarCobrancaPix, obterPixQrCode, type CustomerData } from '@/lib/asaas';
import { gerarFichasParaVenda, cancelarFichasDaVenda } from './fichas';
import type { FormaPagamento, StatusPagamento, Venda, VendaItem } from './types';

export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  precoUnit: number;
  quantidade: number;
}

interface VendaRow {
  id: string;
  evento_id: string;
  caixa_id: string;
  cliente_id: string;
  convidado_id: string | null;
  total: number;
  forma_pagamento: FormaPagamento;
  status_pagamento: StatusPagamento;
  asaas_payment_id: string | null;
  pix_payload: string | null;
  pix_qr_code_base64: string | null;
  criado_em: string;
  pago_em: string | null;
  cancelado_em: string | null;
  cancelado_por: string | null;
}

interface VendaItemRow {
  id: string;
  venda_id: string;
  produto_id: string;
  nome: string;
  preco_unit: number;
  quantidade: number;
  subtotal: number;
}

function rowToVenda(row: VendaRow): Venda {
  return {
    id: row.id,
    eventoId: row.evento_id,
    caixaId: row.caixa_id,
    clienteId: row.cliente_id,
    convidadoId: row.convidado_id,
    total: row.total,
    formaPagamento: row.forma_pagamento,
    statusPagamento: row.status_pagamento,
    asaasPaymentId: row.asaas_payment_id,
    pixPayload: row.pix_payload,
    pixQrCodeBase64: row.pix_qr_code_base64,
    criadoEm: row.criado_em,
    pagoEm: row.pago_em,
    canceladoEm: row.cancelado_em,
    canceladoPor: row.cancelado_por,
  };
}

function rowToVendaItem(row: VendaItemRow): VendaItem {
  return {
    id: row.id,
    vendaId: row.venda_id,
    produtoId: row.produto_id,
    nome: row.nome,
    precoUnit: row.preco_unit,
    quantidade: row.quantidade,
    subtotal: row.subtotal,
  };
}

export async function criarVenda(params: {
  eventoId: string;
  caixaId: string;
  clienteId: string;
  convidadoId?: string | null;
  itens: ItemCarrinho[];
  formaPagamento: FormaPagamento;
}): Promise<Venda> {
  for (const item of params.itens) {
    const produto = await getProduto(item.produtoId);
    if (produto && produto.estoque !== null && produto.estoque < item.quantidade) {
      throw new Error(`Estoque insuficiente de "${produto.nome}" (disponível: ${produto.estoque}).`);
    }
  }

  const total = params.itens.reduce((sum, i) => sum + i.precoUnit * i.quantidade, 0);
  const id = randomUUID();
  const agora = new Date().toISOString();

  let asaasPaymentId: string | null = null;
  let pixPayload: string | null = null;
  let pixQrCodeBase64: string | null = null;
  const statusPagamento: StatusPagamento = params.formaPagamento !== 'pix' ? 'pago' : 'pendente';
  const pagoEm: string | null = params.formaPagamento !== 'pix' ? agora : null;

  if (params.formaPagamento === 'pix') {
    const cliente = await getCliente(params.clienteId);
    if (!cliente) throw new Error('Cliente não encontrado.');
    if (!cliente.asaasWalletId) {
      throw new Error(
        'Este cliente ainda não completou o cadastro no Asaas — conclua o onboarding em Clientes antes de cobrar por PIX.'
      );
    }

    let customerData: CustomerData = { name: `Consumidor - ${cliente.nome}` };
    if (params.convidadoId) {
      const convidado = await getConvidado(params.convidadoId);
      if (convidado) {
        customerData = {
          name: convidado.nome || customerData.name,
          ...(convidado.cpf ? { cpfCnpj: convidado.cpf } : {}),
          ...(convidado.email ? { email: convidado.email } : {}),
          ...(convidado.telefone ? { mobilePhone: convidado.telefone } : {}),
        };
      }
    }

    const cobranca = await criarCobrancaPix({
      valor: total,
      externalReference: id,
      customerData,
      split: [{ walletId: cliente.asaasWalletId, percentualValue: 100 - cliente.comissaoPercentual }],
    });
    const qr = await obterPixQrCode(cobranca.id);

    asaasPaymentId = cobranca.id;
    pixPayload = qr.payload;
    pixQrCodeBase64 = qr.encodedImage;
  }

  const { data, error } = await supabase
    .from('vendas')
    .insert({
      id,
      evento_id: params.eventoId,
      caixa_id: params.caixaId,
      cliente_id: params.clienteId,
      convidado_id: params.convidadoId ?? null,
      total,
      forma_pagamento: params.formaPagamento,
      status_pagamento: statusPagamento,
      asaas_payment_id: asaasPaymentId,
      pix_payload: pixPayload,
      pix_qr_code_base64: pixQrCodeBase64,
      pago_em: pagoEm,
    })
    .select('*')
    .single();
  if (error) throw error;

  const itensRows = params.itens.map((item) => ({
    venda_id: id,
    produto_id: item.produtoId,
    nome: item.nome,
    preco_unit: item.precoUnit,
    quantidade: item.quantidade,
    subtotal: item.precoUnit * item.quantidade,
  }));
  const { error: itensError } = await supabase.from('venda_itens').insert(itensRows);
  if (itensError) throw itensError;

  for (const item of params.itens) {
    await ajustarEstoque(item.produtoId, -item.quantidade);
  }

  if (statusPagamento === 'pago') {
    const evento = await getEvento(params.eventoId);
    if (evento?.fichasHabilitadas) {
      await gerarFichasParaVenda(id, params.clienteId);
    }
  }

  return rowToVenda(data as VendaRow);
}

/**
 * Chamada pelo webhook real do Asaas (`PAYMENT_RECEIVED`) — ver
 * src/app/api/asaas/webhook/route.ts. Idempotente: repetir a chamada não tem efeito.
 */
export async function confirmarPagamento(vendaId: string): Promise<void> {
  const venda = await getVenda(vendaId);
  if (!venda || venda.statusPagamento === 'pago') return;
  const { error } = await supabase
    .from('vendas')
    .update({ status_pagamento: 'pago', pago_em: new Date().toISOString() })
    .eq('id', vendaId);
  if (error) throw error;

  const evento = await getEvento(venda.eventoId);
  if (evento?.fichasHabilitadas) {
    await gerarFichasParaVenda(vendaId, venda.clienteId);
  }
}

export async function confirmarPagamentoPorAsaasPaymentId(asaasPaymentId: string): Promise<void> {
  const { data, error } = await supabase
    .from('vendas')
    .select('id')
    .eq('asaas_payment_id', asaasPaymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return;
  await confirmarPagamento((data as { id: string }).id);
}

export async function cancelarVenda(vendaId: string, canceladoPor: string): Promise<void> {
  const venda = await getVenda(vendaId);
  if (!venda || venda.statusPagamento === 'cancelado') return;

  const { error } = await supabase
    .from('vendas')
    .update({
      status_pagamento: 'cancelado',
      cancelado_em: new Date().toISOString(),
      cancelado_por: canceladoPor,
    })
    .eq('id', vendaId);
  if (error) throw error;

  const itens = await listItensPorVenda(vendaId);
  for (const item of itens) {
    await ajustarEstoque(item.produtoId, item.quantidade);
  }

  await cancelarFichasDaVenda(vendaId);
}

export async function getVenda(id: string): Promise<Venda | undefined> {
  const { data, error } = await supabase.from('vendas').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? rowToVenda(data as VendaRow) : undefined;
}

export async function listItensPorVenda(vendaId: string): Promise<VendaItem[]> {
  const { data, error } = await supabase.from('venda_itens').select('*').eq('venda_id', vendaId);
  if (error) throw error;
  return (data as VendaItemRow[]).map(rowToVendaItem);
}

export async function listVendasPorCliente(clienteId: string): Promise<Venda[]> {
  const { data, error } = await supabase.from('vendas').select('*').eq('cliente_id', clienteId);
  if (error) throw error;
  return (data as VendaRow[]).map(rowToVenda);
}

export async function listVendasPorCaixa(caixaId: string): Promise<Venda[]> {
  const { data, error } = await supabase
    .from('vendas')
    .select('*')
    .eq('caixa_id', caixaId)
    .order('criado_em', { ascending: false });
  if (error) throw error;
  return (data as VendaRow[]).map(rowToVenda);
}
