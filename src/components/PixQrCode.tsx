'use client';

import { QRCodeSVG } from 'qrcode.react';

export function PixQrCode({ payload }: { payload: string }) {
  return (
    <div className="bg-white p-4 rounded-lg inline-block">
      <QRCodeSVG value={payload} size={220} />
    </div>
  );
}
