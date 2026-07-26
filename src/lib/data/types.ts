export type FormaPagamento = 'pix' | 'dinheiro';
export type StatusPagamento = 'pendente' | 'pago' | 'cancelado';
export type StatusCaixa = 'aberto' | 'fechado';

export type StatusOnboardingAsaas = 'nao_iniciado' | 'aguardando_documentos' | 'em_analise' | 'aprovado';

export interface Cliente {
  id: string;
  nome: string;
  comissaoPercentual: number;
  asaasSubcontaId: string | null;
  asaasWalletId: string | null;
  asaasStatusOnboarding: StatusOnboardingAsaas;
}

export interface Evento {
  id: string;
  clienteId: string;
  nome: string;
  data: string;
}

export interface Produto {
  id: string;
  clienteId: string;
  nome: string;
  categoria: string;
  preco: number;
  ativo: boolean;
  estoque: number | null;
}

export interface Caixa {
  id: string;
  eventoId: string;
  operador: string;
  status: StatusCaixa;
  valorAbertura: number;
  valorFechamento: number | null;
  abertoEm: string;
  fechadoEm: string | null;
}

export interface VendaItem {
  id: string;
  vendaId: string;
  produtoId: string;
  nome: string;
  precoUnit: number;
  quantidade: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  eventoId: string;
  caixaId: string;
  clienteId: string;
  convidadoId: string | null;
  total: number;
  formaPagamento: FormaPagamento;
  statusPagamento: StatusPagamento;
  asaasPaymentId: string | null;
  pixPayload: string | null;
  pixQrCodeBase64: string | null;
  criadoEm: string;
  pagoEm: string | null;
  canceladoEm: string | null;
  canceladoPor: string | null;
}

export interface Convidado {
  id: string;
  clienteId: string;
  eventoId: string;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  numeroCartaoConsumo: string | null;
  consentimentoLgpdEm: string | null;
  criadoEm: string;
}

export type StatusFicha = 'emitida' | 'resgatada' | 'cancelada';

export interface Ficha {
  id: string;
  vendaId: string;
  produtoId: string;
  clienteId: string;
  nomeProduto: string;
  codigo: string;
  status: StatusFicha;
  emitidaEm: string;
  resgatadaEm: string | null;
  resgatadaPor: string | null;
}
