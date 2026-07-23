import type { Cliente, Evento, Produto, Caixa, Venda, VendaItem, Convidado } from './types';

interface Store {
  clientes: Cliente[];
  eventos: Evento[];
  produtos: Produto[];
  caixas: Caixa[];
  vendas: Venda[];
  vendaItens: VendaItem[];
  convidados: Convidado[];
}

function seed(): Store {
  const clientes: Cliente[] = [
    { id: 'cli-1', nome: 'Buffet Sabor & Arte', comissaoPercentual: 10 },
    { id: 'cli-2', nome: 'Eventos Vitória', comissaoPercentual: 8 },
  ];

  const eventos: Evento[] = [
    { id: 'evt-1', clienteId: 'cli-1', nome: 'Casamento Ana & Pedro', data: '2026-08-15' },
    { id: 'evt-2', clienteId: 'cli-2', nome: 'Formatura Turma 2026', data: '2026-09-05' },
  ];

  const produtos: Produto[] = [
    { id: 'prod-1', clienteId: 'cli-1', nome: 'Cerveja Long Neck', categoria: 'Bebidas', preco: 12, ativo: true },
    { id: 'prod-2', clienteId: 'cli-1', nome: 'Água Mineral', categoria: 'Bebidas', preco: 5, ativo: true },
    { id: 'prod-3', clienteId: 'cli-1', nome: 'Refrigerante Lata', categoria: 'Bebidas', preco: 7, ativo: true },
    { id: 'prod-4', clienteId: 'cli-1', nome: 'Coxinha', categoria: 'Salgados', preco: 8, ativo: true },
    { id: 'prod-5', clienteId: 'cli-1', nome: 'Pão de Queijo', categoria: 'Salgados', preco: 6, ativo: true },
    { id: 'prod-6', clienteId: 'cli-2', nome: 'Caipirinha', categoria: 'Bebidas', preco: 18, ativo: true },
    { id: 'prod-7', clienteId: 'cli-2', nome: 'Água com Gás', categoria: 'Bebidas', preco: 6, ativo: true },
    { id: 'prod-8', clienteId: 'cli-2', nome: 'Brownie', categoria: 'Doces', preco: 10, ativo: true },
    { id: 'prod-9', clienteId: 'cli-2', nome: 'Brigadeiro', categoria: 'Doces', preco: 4, ativo: true },
  ];

  return { clientes, eventos, produtos, caixas: [], vendas: [], vendaItens: [], convidados: [] };
}

const globalForStore = globalThis as unknown as { __pdvStore?: Store; __pdvIdCounter?: number };

export const store: Store = globalForStore.__pdvStore ?? (globalForStore.__pdvStore = seed());

export function nextId(prefix: string): string {
  globalForStore.__pdvIdCounter = (globalForStore.__pdvIdCounter ?? 0) + 1;
  return `${prefix}-${Date.now()}-${globalForStore.__pdvIdCounter}`;
}
