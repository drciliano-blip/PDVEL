'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { confirmarPagamentoAction } from '@/app/(admin)/venda/[id]/pix/actions';
import { Button } from '@/components/ui/Button';

export function ConfirmarPagamentoButton({ vendaId }: { vendaId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await confirmarPagamentoAction(vendaId);
          router.refresh();
        })
      }
    >
      {isPending ? 'Confirmando…' : 'Simular pagamento confirmado (webhook)'}
    </Button>
  );
}
