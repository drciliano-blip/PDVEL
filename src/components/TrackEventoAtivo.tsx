'use client';

import { useEffect } from 'react';
import { setEventoAtivoAction } from '@/app/(admin)/actions/evento-ativo';

export function TrackEventoAtivo({ eventoId }: { eventoId: string }) {
  useEffect(() => {
    setEventoAtivoAction(eventoId);
  }, [eventoId]);

  return null;
}
