'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setClienteAtivoAction } from '@/app/(admin)/actions/cliente-ativo';
import { setEventoAtivoAction } from '@/app/(admin)/actions/evento-ativo';
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
          await setEventoAtivoAction(eventoId);
          router.push(`/eventos/${eventoId}`);
        })
      }
    >
      Entrar
    </Button>
  );
}
