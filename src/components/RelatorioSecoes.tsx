import { Card } from '@/components/ui/Card';

interface LinhaRelatorio {
  key: string;
  label: string;
  valor: number;
  extra: string;
}

export function Secao({ titulo, linhas }: { titulo: string; linhas: LinhaRelatorio[] }) {
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
