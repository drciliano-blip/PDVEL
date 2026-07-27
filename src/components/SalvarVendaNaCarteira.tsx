'use client';

import { useEffect } from 'react';
import { adicionarVendaNaCarteira } from '@/lib/carteira';

export function SalvarVendaNaCarteira({ eventoId, vendaId }: { eventoId: string; vendaId: string }) {
  useEffect(() => {
    adicionarVendaNaCarteira(eventoId, vendaId);
  }, [eventoId, vendaId]);
  return null;
}
