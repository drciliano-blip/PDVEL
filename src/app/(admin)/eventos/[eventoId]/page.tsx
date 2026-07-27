import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventoComDetalhes } from '@/lib/data/eventos';
import { listCaixasAbertosPorEvento } from '@/lib/data/caixas';
import { contarFichasEmitidasPorEvento } from '@/lib/data/fichas';
import { gerarRelatorioVendas } from '@/lib/data/relatorios';
import { getClienteAtivoId } from '@/lib/session';
import { categorizarEvento } from '@/lib/eventoStatus';
import { Card } from '@/components/ui/Card';
import { buttonClasses } from '@/components/ui/styles';

interface AoVivoPageProps {
  params: Promise<{ eventoId: string }>;
}

export default async function AoVivoPage({ params }: AoVivoPageProps) {
  const { eventoId } = await params;
  const evento = await getEventoComDetalhes(eventoId);
  if (!evento) notFound();

  const clienteId = await getClienteAtivoId();
  if (!clienteId) notFound();

  const [relatorio, caixasAbertos, fichasAResgatar] = await Promise.all([
    gerarRelatorioVendas(clienteId),
    listCaixasAbertosPorEvento(eventoId),
    contarFichasEmitidasPorEvento(eventoId),
  ]);

  const dadosEvento = relatorio.porEvento.find((e) => e.eventoId === eventoId);
  const aoVivo = categorizarEvento(evento) === 'andamento';

  const kpis = [
    { label: 'Vendas', valor: `R$ ${(dadosEvento?.total ?? 0).toFixed(2)}` },
    { label: 'Pedidos', valor: String(dadosEvento?.quantidadeVendas ?? 0) },
    { label: 'Caixas abertos', valor: String(caixasAbertos.length) },
    { label: 'Fichas a resgatar', valor: String(fichasAResgatar) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {aoVivo && (
        <div className="flex flex-wrap gap-3">
          <Link href={`/eventos/${eventoId}/venda`} className={buttonClasses('primary', 'lg', 'flex-1 min-w-[150px]')}>
            Vender
          </Link>
          <Link
            href={`/eventos/${eventoId}/fichas/resgatar`}
            className={buttonClasses('secondary', 'lg', 'flex-1 min-w-[150px]')}
          >
            Resgatar ficha
          </Link>
          <Link href={`/eventos/${eventoId}/caixa`} className={buttonClasses('secondary', 'lg', 'flex-1 min-w-[150px]')}>
            Abrir caixa
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-2xl font-semibold">{kpi.valor}</p>
            <p className="text-xs text-muted uppercase tracking-wide mt-1">{kpi.label}</p>
          </Card>
        ))}
      </div>

      <p className="text-sm">
        <Link href={`/totem/${eventoId}`} className="text-accent underline">
          Abrir totem de autoatendimento
        </Link>
      </p>

      {caixasAbertos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Caixas abertos agora
          </h2>
          <Card padding={false} className="divide-y divide-border">
            {caixasAbertos.map((caixa) => (
              <div key={caixa.id} className="flex justify-between px-4 py-3 text-sm">
                <span className="font-medium">{caixa.operador}</span>
                <span className="text-muted">
                  Abertura R$ {caixa.valorAbertura.toFixed(2)} · desde{' '}
                  {new Date(caixa.abertoEm).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
