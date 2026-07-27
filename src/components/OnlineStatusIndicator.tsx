'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';

export function OnlineStatusIndicator() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => setOnline(navigator.onLine));
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online ? (
    <Badge tone="success">Online</Badge>
  ) : (
    <Badge tone="danger">Offline — dados podem estar desatualizados</Badge>
  );
}
