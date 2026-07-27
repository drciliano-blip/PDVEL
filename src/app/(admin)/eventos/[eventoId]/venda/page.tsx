import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { getClienteAtivoId, getCaixaAtivoId } from '@/lib/session';
import { VendaForm } from '@/components/VendaForm';

interface VendaPageProps {
  params: Promise<{ eventoId: string }>;
}

export default async function VendaPage({ params }: VendaPageProps) {
  const { eventoId } = await params;
  const clienteId = await getClienteAtivoId();
  if (!clienteId) notFound();

  const caixaAtivoId = await getCaixaAtivoId(eventoId);
  const produtos = (await listProdutosByCliente(clienteId)).filter((p) => p.ativo);

  return (
    <div className="flex flex-col gap-6">
      {!caixaAtivoId ? (
        <div className="rounded-lg border border-warning/30 bg-warning-bg p-5">
          <p className="text-warning">Este aparelho ainda não tem um caixa aberto neste evento.</p>
          <Link href={`/eventos/${eventoId}/caixa`} className="text-sm text-warning underline">
            Abrir ou escolher um caixa
          </Link>
        </div>
      ) : produtos.length === 0 ? (
        <p className="text-muted">
          Nenhum produto ativo no cardápio.{' '}
          <Link href={`/eventos/${eventoId}/cardapio`} className="underline">
            Cadastrar produtos
          </Link>
        </p>
      ) : (
        <VendaForm produtos={produtos} eventoId={eventoId} caixaId={caixaAtivoId} clienteId={clienteId} />
      )}
    </div>
  );
}
