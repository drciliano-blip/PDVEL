import Link from 'next/link';
import { listEventosByCliente } from '@/lib/data/eventos';
import { listCaixasAbertosPorEvento, listCaixasPorEvento } from '@/lib/data/caixas';
import { listVendasPorCaixa } from '@/lib/data/vendas';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { getClienteAtivoId, getCaixaAtivoId } from '@/lib/session';
import {
  abrirCaixaAction,
  fecharCaixaComContagemAction,
  usarCaixaAction,
  soltarCaixaAction,
  cancelarVendaAction,
} from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SemClienteAtivo } from '@/components/SemClienteAtivo';

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

const FORMA_LABEL = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
} as const;

interface CaixaPageProps {
  searchParams: Promise<{ evento?: string }>;
}

export default async function CaixaPage({ searchParams }: CaixaPageProps) {
  const clienteId = await getClienteAtivoId();
  if (!clienteId) return <SemClienteAtivo />;

  const eventos = await listEventosByCliente(clienteId);
  const { evento: eventoParam } = await searchParams;

  if (eventos.length === 0) {
    return <p className="text-muted">Este cliente ainda não tem eventos cadastrados.</p>;
  }

  const eventoAtivo = eventos.find((e) => e.id === eventoParam) ?? eventos[0];
  const caixaAtivoId = await getCaixaAtivoId(eventoAtivo.id);
  const caixasAbertos = await listCaixasAbertosPorEvento(eventoAtivo.id);
  const meuCaixa = caixasAbertos.find((c) => c.id === caixaAtivoId) ?? null;
  const outrosAbertos = caixasAbertos.filter((c) => c.id !== caixaAtivoId);
  const historico = await listCaixasPorEvento(eventoAtivo.id);
  const vendasDoMeuCaixa = meuCaixa ? await listVendasPorCaixa(meuCaixa.id) : [];
  const produtosComEstoque = (await listProdutosByCliente(clienteId)).filter(
    (p) => p.estoque !== null
  );

  const porCategoria = new Map<string, typeof produtosComEstoque>();
  for (const produto of produtosComEstoque) {
    const lista = porCategoria.get(produto.categoria) ?? [];
    lista.push(produto);
    porCategoria.set(produto.categoria, lista);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Caixa</h1>
        <p className="text-muted text-sm">
          Vários caixas podem ficar abertos ao mesmo tempo no mesmo evento (totem, caixas
          volantes, tablets) — este aparelho lembra qual é o seu.
        </p>
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

      {meuCaixa ? (
        <Card className="border-success/30 bg-success-bg/40 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-success font-medium">Seu caixa neste aparelho</span>
            <span className="text-muted text-sm">Operador: {meuCaixa.operador}</span>
          </div>
          <p className="text-sm text-muted">
            Valor de abertura: R$ {meuCaixa.valorAbertura.toFixed(2)} — desde{' '}
            {new Date(meuCaixa.abertoEm).toLocaleString('pt-BR')}
          </p>

          <form action={soltarCaixaAction}>
            <Button type="submit" variant="ghost" size="sm">
              Soltar este caixa deste aparelho (sem fechar)
            </Button>
          </form>

          <form
            action={fecharCaixaComContagemAction.bind(null, meuCaixa.id)}
            className="flex flex-col gap-4 border-t border-border pt-4"
          >
            {produtosComEstoque.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Contagem física de estoque (opcional)</p>
                {Array.from(porCategoria.entries()).map(([categoria, produtos]) => (
                  <div key={categoria} className="flex flex-col gap-2">
                    <p className="text-xs text-muted uppercase tracking-wide">{categoria}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {produtos.map((produto) => (
                        <div key={produto.id} className="flex items-center justify-between gap-2">
                          <label className="text-sm">{produto.nome}</label>
                          <Input
                            name={`contagem_${produto.id}`}
                            type="number"
                            min="0"
                            step="1"
                            placeholder={`esperado: ${produto.estoque}`}
                            className="w-32"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Valor de fechamento (R$)</label>
                <Input name="valorFechamento" type="number" step="0.01" min="0" required className="w-40" />
              </div>
              <Button type="submit" variant="danger">
                Fechar caixa
              </Button>
            </div>
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
            <Button type="submit">Abrir novo caixa</Button>
          </form>
        </Card>
      )}

      {outrosAbertos.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Outros caixas abertos agora neste evento
          </h2>
          <Card padding={false} className="divide-y divide-border">
            {outrosAbertos.map((caixa) => (
              <div
                key={caixa.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium">{caixa.operador}</span>
                <span className="text-muted">
                  desde {new Date(caixa.abertoEm).toLocaleTimeString('pt-BR')}
                </span>
                <form action={usarCaixaAction.bind(null, caixa.id)}>
                  <Button type="submit" variant="secondary" size="sm">
                    Usar este caixa neste aparelho
                  </Button>
                </form>
              </div>
            ))}
          </Card>
        </div>
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

      {meuCaixa && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
            Vendas deste caixa
          </h2>
          {vendasDoMeuCaixa.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma venda registrada ainda.</p>
          ) : (
            <Card padding={false} className="divide-y divide-border">
              {vendasDoMeuCaixa.map((venda) => (
                <div
                  key={venda.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="text-muted">
                    {new Date(venda.criadoEm).toLocaleTimeString('pt-BR')}
                  </span>
                  <span className="font-medium">R$ {venda.total.toFixed(2)}</span>
                  <span className="text-muted">{FORMA_LABEL[venda.formaPagamento]}</span>
                  <Badge tone={STATUS_TONE[venda.statusPagamento]}>
                    {STATUS_LABEL[venda.statusPagamento]}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Link href={`/venda/${venda.id}/recibo`} className="text-xs text-accent underline">
                      Recibo
                    </Link>
                    {venda.statusPagamento !== 'cancelado' && (
                      <form action={cancelarVendaAction.bind(null, venda.id, meuCaixa.operador)}>
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
