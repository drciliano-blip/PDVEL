'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') {
      // Em dev (Turbopack), o SW acaba servindo chunks desatualizados depois
      // de hot-reloads e quebra a navegação — só vale a pena em produção.
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      return;
    }
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch((err) => console.error('Falha ao registrar o service worker do PDV:', err));
  }, []);

  return null;
}
