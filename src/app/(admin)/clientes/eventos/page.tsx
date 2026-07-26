import { listTodosEventosComDetalhes } from '@/lib/data/eventos';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EntrarEventoButton } from '@/components/EntrarEventoButton';
import { ClientesSubNav } from '@/components/ClientesSubNav';
import type { EventoComDetalhes } from '@/lib/data/types';

function categorizar(evento: EventoComDetalhes): 'andamento' | 'agendado' | 'encerrado' {
  if (evento.statusCaixa === 'aberto') return 'andamento';
  if (evento.statusCaixa === 'fechado') return 'encerrado';
  const hoje = new Date().toISOString().slice(0, 10);
  return evento.data >= hoje ? 'agendado' : 'encerrado';
}

const CATEGORIAS = [
  { chave: 'andamento', titulo: 'Em andamento', badge: 'success' as const },
  { chave: 'agendado', titulo: 'Agendados', badge: 'warning' as const },
  { chave: 'encerrado', titulo: 'Encerrados', badge: 'neutral' as const },
];

export default async function EventosPage() {
  const eventos = await listTodosEventosComDetalhes();
  const porCategoria = new Map<string, EventoComDetalhes[]>();
  for (const evento of eventos) {
    const categoria = categorizar(evento);
    const lista = porCategoria.get(categoria) ?? [];
    lista.push(evento);
    porCategoria.set(categoria, lista);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Eventos</h1>
        <p className="text-muted text-sm">Todos os eventos, de todos os clientes e espaços.</p>
      </div>

      <ClientesSubNav ativo="eventos" />

      {eventos.length === 0 ? (
        <p className="text-muted">Nenhum evento cadastrado ainda.</p>
      ) : (
        CATEGORIAS.map(({ chave, titulo, badge }) => {
          const lista = porCategoria.get(chave) ?? [];
          if (lista.length === 0) return null;
          return (
            <div key={chave}>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-2">
                {titulo} <Badge tone={badge}>{lista.length}</Badge>
              </h2>
              <Card padding={false} className="divide-y divide-border">
                {lista.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{evento.nome}</p>
                      <p className="text-xs text-muted">
                        {evento.clienteNome} · {evento.espacoNome ?? 'sem espaço definido'} ·{' '}
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <EntrarEventoButton eventoId={evento.id} clienteId={evento.clienteId} />
                  </div>
                ))}
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}
