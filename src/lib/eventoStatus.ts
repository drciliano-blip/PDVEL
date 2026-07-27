import type { EventoComDetalhes } from '@/lib/data/types';

export type CategoriaEvento = 'andamento' | 'agendado' | 'encerrado';

export function categorizarEvento(evento: EventoComDetalhes): CategoriaEvento {
  if (evento.statusCaixa === 'aberto') return 'andamento';
  if (evento.statusCaixa === 'fechado') return 'encerrado';
  const hoje = new Date().toISOString().slice(0, 10);
  return evento.data >= hoje ? 'agendado' : 'encerrado';
}

export const CATEGORIAS_EVENTO = [
  { chave: 'andamento', titulo: 'Em andamento', badge: 'success' as const },
  { chave: 'agendado', titulo: 'Futuros', badge: 'warning' as const },
  { chave: 'encerrado', titulo: 'Encerrados', badge: 'neutral' as const },
] as const;
