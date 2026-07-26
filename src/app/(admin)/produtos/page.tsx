import { listProdutosByCliente } from '@/lib/data/produtos';
import { getClienteAtivoId } from '@/lib/session';
import { createProdutoAction, deleteProdutoAction, toggleProdutoAtivoAction } from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SemClienteAtivo } from '@/components/SemClienteAtivo';

export default async function ProdutosPage() {
  const clienteId = await getClienteAtivoId();
  if (!clienteId) return <SemClienteAtivo />;

  const produtos = await listProdutosByCliente(clienteId);
  const porCategoria = new Map<string, typeof produtos>();
  for (const produto of produtos) {
    const lista = porCategoria.get(produto.categoria) ?? [];
    lista.push(produto);
    porCategoria.set(produto.categoria, lista);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Catálogo de produtos</h1>
        <p className="text-muted text-sm">Cardápio próprio deste cliente.</p>
      </div>

      <Card>
        <form action={createProdutoAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Nome</label>
            <Input name="nome" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Categoria</label>
            <Input name="categoria" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Preço (R$)</label>
            <Input name="preco" type="number" step="0.01" min="0.01" required className="w-28" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Estoque (vazio = ilimitado)</label>
            <Input name="estoque" type="number" step="1" min="0" className="w-36" />
          </div>
          <Button type="submit">Adicionar produto</Button>
        </form>
      </Card>

      {produtos.length === 0 ? (
        <p className="text-muted">Nenhum produto cadastrado ainda para este cliente.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {Array.from(porCategoria.entries()).map(([categoria, itens]) => (
            <div key={categoria}>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-2">
                {categoria}
              </h2>
              <Card padding={false} className="divide-y divide-border">
                {itens.map((produto) => (
                  <div
                    key={produto.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-medium">{produto.nome}</span>
                      <span className="text-sm text-muted">R$ {produto.preco.toFixed(2)}</span>
                      <Badge tone={produto.ativo ? 'success' : 'neutral'}>
                        {produto.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {produto.estoque !== null && (
                        <Badge tone={produto.estoque === 0 ? 'danger' : produto.estoque <= 5 ? 'warning' : 'neutral'}>
                          Estoque: {produto.estoque}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={toggleProdutoAtivoAction.bind(null, produto.id)}>
                        <Button type="submit" variant="secondary" size="sm">
                          {produto.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </form>
                      <form action={deleteProdutoAction.bind(null, produto.id)}>
                        <Button type="submit" variant="danger" size="sm">
                          Excluir
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
