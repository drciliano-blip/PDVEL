import { listEspacos } from '@/lib/data/espacos';
import { createEspacoAction } from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default async function EspacosPage() {
  const espacos = await listEspacos();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Espaços</h1>
        <p className="text-muted text-sm">Os espaços físicos próprios onde os eventos acontecem.</p>
      </div>

      <Card>
        <form action={createEspacoAction} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Nome do espaço</label>
            <Input name="nome" required className="w-56" />
          </div>
          <Button type="submit">Adicionar espaço</Button>
        </form>
      </Card>

      {espacos.length === 0 ? (
        <p className="text-muted">Nenhum espaço cadastrado ainda.</p>
      ) : (
        <Card padding={false} className="divide-y divide-border">
          {espacos.map((espaco) => (
            <div key={espaco.id} className="px-4 py-3 text-sm">
              {espaco.nome}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
