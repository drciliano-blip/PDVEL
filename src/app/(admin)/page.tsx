import Link from 'next/link';
import { getCliente } from '@/lib/data/clientes';
import { listTodosEventosComDetalhes } from '@/lib/data/eventos';
import { listEspacos } from '@/lib/data/espacos';
import { getClienteAtivoId } from '@/lib/session';
import { createEventoAction } from './clientes/actions';
import { categorizarEvento, CATEGORIAS_EVENTO } from '@/lib/eventoStatus';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EntrarEventoButton } from '@/components/EntrarEventoButton';
import type { EventoComDetalhes } from '@/lib/data/types';

export default async function Home() {
  const clienteId = await getClienteAtivoId();

  if (!clienteId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Bem-vindo</h1>
        <p className="text-muted">
          Nenhum produtor cadastrado ainda.{' '}
          <Link href="/clientes" className="text-accent underline">
            Cadastre o primeiro em Gerenciar → Produtores
          </Link>{' '}
          para começar.
        </p>
      </div>
    );
  }

  const cliente = await getCliente(clienteId);
  const espacos = await listEspacos();
  const eventos = await listTodosEventosComDetalhes(clienteId);

  const porCategoria = new Map<string, EventoComDetalhes[]>();
  for (const evento of eventos) {
    const categoria = categorizarEvento(evento);
    const lista = porCategoria.get(categoria) ?? [];
    lista.push(evento);
    porCategoria.set(categoria, lista);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{cliente?.nome}</h1>
        <p className="text-muted text-sm">Escolha um evento para operar.</p>
      </div>

      <Card>
        <form action={createEventoAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="clienteId" value={clienteId} />
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Novo evento</label>
            <Input name="nome" placeholder="Nome do evento" required className="w-48" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Data</label>
            <Input name="data" type="date" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Espaço</label>
            <select
              name="espacoId"
              className="h-11 rounded-lg border border-border bg-surface px-3 text-sm"
              defaultValue=""
            >
              <option value="">Sem espaço definido</option>
              {espacos.map((espaco) => (
                <option key={espaco.id} value={espaco.id}>
                  {espaco.nome}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted pb-2.5">
            <input type="checkbox" name="fichasHabilitadas" className="w-4 h-4" />
            Habilitar impressão de fichas
          </label>
          <Button type="submit" size="sm">
            Adicionar evento
          </Button>
        </form>
      </Card>

      {eventos.length === 0 ? (
        <p className="text-muted">Nenhum evento cadastrado ainda para este produtor.</p>
      ) : (
        CATEGORIAS_EVENTO.map(({ chave, titulo, badge }) => {
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
                        {evento.espacoNome ?? 'sem espaço definido'} ·{' '}
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/totem/${evento.id}`} className="text-xs text-accent underline">
                        Abrir totem
                      </Link>
                      <EntrarEventoButton eventoId={evento.id} clienteId={evento.clienteId} />
                    </div>
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
