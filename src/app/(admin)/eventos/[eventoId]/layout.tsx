import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventoComDetalhes } from '@/lib/data/eventos';
import { getClienteAtivoId } from '@/lib/session';
import { HubTabs } from '@/components/HubTabs';
import { TrackEventoAtivo } from '@/components/TrackEventoAtivo';

interface EventoHubLayoutProps {
  children: React.ReactNode;
  params: Promise<{ eventoId: string }>;
}

export default async function EventoHubLayout({ children, params }: EventoHubLayoutProps) {
  const { eventoId } = await params;
  const evento = await getEventoComDetalhes(eventoId);
  if (!evento) notFound();

  const clienteAtivoId = await getClienteAtivoId();
  if (clienteAtivoId !== evento.clienteId) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted">
          Este evento pertence a outro produtor — troque o produtor ativo no topo, ou{' '}
          <Link href="/" className="text-accent underline">
            volte para a lista de eventos
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <TrackEventoAtivo eventoId={evento.id} />
      <div className="rounded-xl border border-border border-l-4 border-l-accent bg-surface px-5 py-4">
        <p className="text-xl font-semibold">{evento.nome}</p>
        <p className="text-muted text-sm mt-1">
          {new Date(evento.data).toLocaleDateString('pt-BR')} · {evento.espacoNome ?? 'sem espaço definido'}
        </p>
      </div>
      <HubTabs eventoId={evento.id} />
      {children}
    </div>
  );
}
