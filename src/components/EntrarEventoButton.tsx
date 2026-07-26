'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setClienteAtivoAction } from '@/app/(admin)/actions/cliente-ativo';
import { Button } from '@/components/ui/Button';

export function EntrarEventoButton({ eventoId, clienteId }: { eventoId: string; clienteId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await setClienteAtivoAction(clienteId);
          router.push(`/caixa?evento=${eventoId}`);
        })
      }
    >
      Entrar
    </Button>
  );
}
