import { gerarRelatorioVendas } from '@/lib/data/relatorios';
import { getClienteAtivoId } from '@/lib/session';
import { Card } from '@/components/ui/Card';
import { SemClienteAtivo } from '@/components/SemClienteAtivo';
import { AutoRefresh } from '@/components/AutoRefresh';

const FORMA_LABEL: Record<string, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
};

export default async function RelatoriosPage() {
  const clienteId = await getClienteAtivoId();
  if (!clienteId) return <SemClienteAtivo />;

  const relatorio = await gerarRelatorioVendas(clienteId);

  return (
    <div className="flex flex-col gap-8">
      <AutoRefresh intervalMs={10000} />
      <div>
        <h1 className="text-2xl font-semibold">Relatório de vendas</h1>
        <p className="text-muted text-sm">
          Considera apenas vendas pagas. Atualiza sozinho a cada 10 segundos.
        </p>
      </div>

      <Card>
        <span className="text-sm text-muted">Total geral</span>
        <p className="text-3xl font-semibold">R$ {relatorio.totalGeral.toFixed(2)}</p>
      </Card>

      <Secao
        titulo="Por evento"
        linhas={relatorio.porEvento.map((linha) => ({
          key: linha.eventoId,
          label: linha.eventoNome,
          valor: linha.total,
          extra: `${linha.quantidadeVendas} venda(s)`,
        }))}
      />

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
          label: `${linha.operador} — ${linha.eventoNome}`,
          valor: linha.total,
          extra: `${linha.quantidadeVendas} venda(s)`,
        }))}
      />
    </div>
  );
}

interface LinhaRelatorio {
  key: string;
  label: string;
  valor: number;
  extra: string;
}

function Secao({ titulo, linhas }: { titulo: string; linhas: LinhaRelatorio[] }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">{titulo}</h2>
      {linhas.length === 0 ? (
        <p className="text-sm text-muted">Sem dados ainda.</p>
      ) : (
        <Card padding={false} className="divide-y divide-border">
          {linhas.map((linha) => (
            <Linha key={linha.key} label={linha.label} valor={linha.valor} extra={linha.extra} />
          ))}
        </Card>
      )}
    </div>
  );
}

function Linha({ label, valor, extra }: { label: string; valor: number; extra: string }) {
  return (
    <div className="flex justify-between text-sm px-4 py-2.5">
      <span>{label}</span>
      <span className="text-muted">
        {extra} — R$ {valor.toFixed(2)}
      </span>
    </div>
  );
}
