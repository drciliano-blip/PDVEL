import Link from 'next/link';
import { notFound } from 'next/navigation';
import { gerarRelatorioVendas } from '@/lib/data/relatorios';
import { getClienteAtivoId } from '@/lib/session';
import { Card } from '@/components/ui/Card';
import { AutoRefresh } from '@/components/AutoRefresh';
import { Secao } from '@/components/RelatorioSecoes';

const FORMA_LABEL: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
};

interface RelatoriosEventoPageProps {
  params: Promise<{ eventoId: string }>;
}

export default async function RelatoriosEventoPage({ params }: RelatoriosEventoPageProps) {
  const { eventoId } = await params;
  const clienteId = await getClienteAtivoId();
  if (!clienteId) notFound();

  const relatorio = await gerarRelatorioVendas(clienteId, eventoId);

  return (
    <div className="flex flex-col gap-8">
      <AutoRefresh intervalMs={10000} />
      <p className="text-muted text-sm">
        Considera apenas vendas pagas deste evento (sem cortesias). Atualiza sozinho a cada 10
        segundos. Veja{' '}
        <Link href="/relatorios" className="underline">
          o total de todos os eventos deste produtor
        </Link>
        .
      </p>

      <Card>
        <span className="text-sm text-muted">Total do evento</span>
        <p className="text-3xl font-semibold">R$ {relatorio.totalGeral.toFixed(2)}</p>
      </Card>

      <Secao
        titulo="Por forma de pagamento"
        linhas={relatorio.porFormaPagamento.map((linha) => ({
          key: linha.formaPagamento,
          label: FORMA_LABEL[linha.formaPagamento] ?? linha.formaPagamento,
          valor: linha.total,
          extra: `${linha.quantidadeVendas} venda(s)`,
        }))}
      />

      <Secao
        titulo="Mais vendidos (ranking)"
        linhas={relatorio.porProduto.map((linha, index) => ({
          key: linha.produtoId,
          label: `${index + 1}. ${linha.nome}`,
          valor: linha.total,
          extra: `${linha.quantidade} un.`,
        }))}
      />

      <Secao
        titulo="Fluxo por horário"
        linhas={relatorio.porHora.map((linha) => ({
          key: String(linha.hora),
          label: `${String(linha.hora).padStart(2, '0')}h`,
          valor: linha.total,
          extra: `${linha.quantidadeVendas} venda(s)`,
        }))}
      />

      <Secao
        titulo="Por operador"
        linhas={relatorio.porOperador.map((linha) => ({
          key: linha.operador,
          label: linha.operador,
          valor: linha.total,
          extra: `${linha.quantidadeVendas} venda(s)`,
        }))}
      />

      <Secao
        titulo="Por caixa / terminal"
        linhas={relatorio.porCaixa.map((linha) => ({
          key: linha.caixaId,
          label: linha.operador,
          valor: linha.total,
          extra: `${linha.quantidadeVendas} venda(s)`,
        }))}
      />
    </div>
  );
}
