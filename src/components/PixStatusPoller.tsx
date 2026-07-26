'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Enquanto a venda está pendente, atualiza a tela periodicamente pra
 * refletir a confirmação do webhook real sem precisar de ação do usuário.
 * Substitui o antigo botão de simular pagamento.
 */
export function PixStatusPoller({ intervalMs = 3000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, router]);

  return null;
}
