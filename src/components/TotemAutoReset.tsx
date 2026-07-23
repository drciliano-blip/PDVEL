'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function TotemAutoReset({ eventoId, delayMs = 6000 }: { eventoId: string; delayMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/totem/${eventoId}`);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [eventoId, delayMs, router]);

  return null;
}
