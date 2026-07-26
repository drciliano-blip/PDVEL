'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function PixQrCode({ qrCodeBase64, payload }: { qrCodeBase64: string; payload: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-lg inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem base64 dinâmica vinda da Asaas, sem otimização aplicável */}
        <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code do PIX" width={220} height={220} />
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(payload);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 2000);
        }}
      >
        {copiado ? 'Copiado!' : 'Copiar código PIX'}
      </Button>
    </div>
  );
}
