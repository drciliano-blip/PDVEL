import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface FichasHubPageProps {
  params: Promise<{ eventoId: string }>;
}

const ACOES = [
  { chave: 'resgatar', titulo: 'Resgatar', descricao: 'Ler o código/QR e entregar o item no balcão.' },
  { chave: 'emitir', titulo: 'Emitir', descricao: 'Gerar fichas avulsas de um produto (venda em dinheiro).' },
  { chave: 'cancelar', titulo: 'Cancelar', descricao: 'Invalidar uma ficha emitida por engano ou perdida.' },
  { chave: 'cortesia', titulo: 'Cortesia', descricao: 'Emitir fichas sem cobrança — não entra no relatório de receita.' },
] as const;

export default async function FichasHubPage({ params }: FichasHubPageProps) {
  const { eventoId } = await params;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {ACOES.map((acao) => (
        <Link key={acao.chave} href={`/eventos/${eventoId}/fichas/${acao.chave}`} className="block">
          <Card className="h-full hover:border-accent/60 transition-colors">
            <h2 className="font-semibold">{acao.titulo}</h2>
            <p className="text-sm text-muted mt-1">{acao.descricao}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
