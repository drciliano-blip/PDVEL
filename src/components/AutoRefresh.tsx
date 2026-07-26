'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dá `router.refresh()` num intervalo — usado onde uma tela precisa refletir
 * mudanças de outro lugar (webhook confirmando pagamento, outro operador
 * vendendo) sem o usuário precisar apertar F5.
 */
export function AutoRefresh({ intervalMs = 3000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, router]);

  return null;
}
