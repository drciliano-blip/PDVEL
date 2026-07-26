'use client';

import { QRCodeSVG } from 'qrcode.react';

export function FichaQrCode({ codigo }: { codigo: string }) {
  return <QRCodeSVG value={codigo} size={64} />;
}
