'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setClienteAtivoAction } from '@/app/(admin)/actions/cliente-ativo';

interface ClienteSelectorProps {
  clientes: { id: string; nome: string }[];
  ativoId: string;
}

export function ClienteSelector({ clientes, ativoId }: ClienteSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted whitespace-nowrap">Cliente ativo</span>
      <select
        value={ativoId}
        disabled={isPending}
        onChange={(e) => {
          const clienteId = e.target.value;
          startTransition(async () => {
            await setClienteAtivoAction(clienteId);
            router.refresh();
          });
        }}
        className="rounded-lg border border-border bg-surface px-2 h-11 text-foreground disabled:opacity-50"
      >
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>
    </label>
  );
}
