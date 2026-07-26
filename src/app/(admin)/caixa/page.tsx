import Link from 'next/link';
import { listEventosByCliente } from '@/lib/data/eventos';
import { getCaixaAbertoPorEvento, listCaixasPorEvento } from '@/lib/data/caixas';
import { listVendasPorCaixa } from '@/lib/data/vendas';
import { getClienteAtivoId } from '@/lib/session';
import { abrirCaixaAction, fecharCaixaAction, cancelarVendaAction } from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const STATUS_TONE = {
  pago: 'success',
  pendente: 'warning',
  cancelado: 'danger',
} as const;

const STATUS_LABEL = {
  pago: 'Pago',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
} as const;

interface CaixaPageProps {
  searchParams: Promise<{ evento?: string }>;
}

export default async function CaixaPage({ searchParams }: CaixaPageProps) {
  const clienteId = await getClienteAtivoId();
  const eventos = await listEventosByCliente(clienteId);
  const { evento: eventoParam } = await searchParams;

  if (eventos.length === 0) {
    return <p className="text-muted">Este cliente ainda não tem eventos cadastrados.</p>;
  }

  const eventoAtivo = eventos.find((e) => e.id === eventoParam) ?? eventos[0];
  const caixaAberto = await getCaixaAbertoPorEvento(eventoAtivo.id);
  const historico = await listCaixasPorEvento(eventoAtivo.id);
  const caixaAtual = caixaAberto ?? historico[0] ?? null;
  const vendasDoCaixa = caixaAtual ? await listVendasPorCaixa(caixaAtual.id) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Caixa</h1>
        <p className="text-muted text-sm">Abertura e fechamento de caixa por evento.</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {eventos.map((evento) => (
          <Link
            key={evento.id}
            href={`/caixa?evento=${evento.id}`}
            className={`rounded-lg px-3 py-2 text-sm border ${
              evento.id === eventoAtivo.id
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border text-muted hover:bg-surface-muted'
            }`}
          >
            {evento.nome}
          </Link>
        ))}
      </div>

      {caixaAberto ? (
        <Card className="border-success/30 bg-success-bg/40 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-success font-medium">Caixa aberto</span>
            <span className="text-muted text-sm">Operador: {caixaAberto.operador}</span>
          </div>
          <p className="text-sm text-muted">
            Valor de abertura: R$ {caixaAberto.valorAbertura.toFixed(2)} — desde{' '}
            {new Date(caixaAberto.abertoEm).toLocaleString('pt-BR')}
          </p>
          <form action={fecharCaixaAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="caixaId" value={caixaAberto.id} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Valor de fechamento (R$)</label>
              <Input name="valorFechamento" type="number" step="0.01" min="0" required className="w-40" />
            </div>
            <Button type="submit" variant="danger">
              Fechar caixa
            </Button>
          </form>
        </Card>
      ) : (
        <Card>
          <form action={abrirCaixaAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="eventoId" value={eventoAtivo.id} />
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Operador</label>
              <Input name="operador" required />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted">Valor de abertura (R$)</label>
              <Input name="valorAbertura" type="number" step="0.01" min="0" required className="w-40" />
            </div>
            <Button type="submit">Abrir caixa</Button>
          </form>
        </Card>
      )}

      {historico.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Histórico deste evento
          </h2>
          <Card padding={false} className="divide-y divide-border">
            {historico.map((caixa) => (
              <div
                key={caixa.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium">{caixa.operador}</span>
                <span className="text-muted">Abertura R$ {caixa.valorAbertura.toFixed(2)}</span>
                <span className="text-muted">
                  Fechamento{' '}
                  {caixa.valorFechamento !== null ? `R$ ${caixa.valorFechamento.toFixed(2)}` : '—'}
                </span>
                <Badge tone={caixa.status === 'aberto' ? 'success' : 'neutral'}>
                  {caixa.status === 'aberto' ? 'Aberto' : 'Fechado'}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      )}

      {caixaAtual && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Vendas deste caixa
          </h2>
          {vendasDoCaixa.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma venda registrada ainda.</p>
          ) : (
            <Card padding={false} className="divide-y divide-border">
              {vendasDoCaixa.map((venda) => (
                <div
                  key={venda.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="text-muted">
                    {new Date(venda.criadoEm).toLocaleTimeString('pt-BR')}
                  </span>
                  <span className="font-medium">R$ {venda.total.toFixed(2)}</span>
                  <span className="text-muted">
                    {venda.formaPagamento === 'pix' ? 'PIX' : 'Dinheiro'}
                  </span>
                  <Badge tone={STATUS_TONE[venda.statusPagamento]}>
                    {STATUS_LABEL[venda.statusPagamento]}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Link href={`/venda/${venda.id}/recibo`} className="text-xs text-accent underline">
                      Recibo
                    </Link>
                    {venda.statusPagamento !== 'cancelado' && (
                      <form action={cancelarVendaAction.bind(null, venda.id, caixaAtual.operador)}>
                        <Button type="submit" variant="danger" size="sm">
                          Cancelar
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
