import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listProdutosByCliente } from '@/lib/data/produtos';
import { getClienteAtivoId, getCaixaAtivoId } from '@/lib/session';
import { EmitirFichaForm } from '@/components/EmitirFichaForm';

interface EmitirPageProps {
  params: Promise<{ eventoId: string }>;
}

export default async function EmitirPage({ params }: EmitirPageProps) {
  const { eventoId } = await params;
  const clienteId = await getClienteAtivoId();
  if (!clienteId) notFound();

  const caixaAtivoId = await getCaixaAtivoId(eventoId);
  const produtos = (await listProdutosByCliente(clienteId)).filter((p) => p.ativo);

  if (!caixaAtivoId) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning-bg p-5">
        <p className="text-warning">Este aparelho ainda não tem um caixa aberto neste evento.</p>
        <Link href={`/eventos/${eventoId}/caixa`} className="text-sm text-warning underline">
          Abrir ou escolher um caixa
        </Link>
      </div>
    );
  }

  return (
    <EmitirFichaForm
      produtos={produtos}
      eventoId={eventoId}
      caixaId={caixaAtivoId}
      clienteId={clienteId}
      cortesia={false}
    />
  );
}
