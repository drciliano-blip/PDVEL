import { listTodosEventosComDetalhes } from '@/lib/data/eventos';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EntrarEventoButton } from '@/components/EntrarEventoButton';

export default async function EventosPage() {
  const eventos = await listTodosEventosComDetalhes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Eventos</h1>
        <p className="text-muted text-sm">Todos os eventos, de todos os clientes e espaços.</p>
      </div>

      {eventos.length === 0 ? (
        <p className="text-muted">Nenhum evento cadastrado ainda.</p>
      ) : (
        <Card padding={false} className="divide-y divide-border">
          {eventos.map((evento) => (
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
              <div className="flex items-center gap-2">
                {evento.statusCaixa === 'aberto' && <Badge tone="success">Caixa aberto</Badge>}
                {evento.statusCaixa === 'fechado' && <Badge tone="neutral">Caixa fechado</Badge>}
                {evento.statusCaixa === null && <Badge tone="warning">Sem caixa ainda</Badge>}
                <EntrarEventoButton eventoId={evento.id} clienteId={evento.clienteId} />
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
