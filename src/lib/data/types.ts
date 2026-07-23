export type FormaPagamento = 'pix' | 'dinheiro';
export type StatusPagamento = 'pendente' | 'pago' | 'cancelado';
export type StatusCaixa = 'aberto' | 'fechado';

export interface Cliente {
  id: string;
  nome: string;
  comissaoPercentual: number;
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
  pixPayloadFake: string | null;
  criadoEm: string;
  pagoEm: string | null;
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
