'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface ScannerProps {
  onDetected: (valor: string) => void;
  onFechar: () => void;
}

export function Scanner({ onDetected, onFechar }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let ativo = true;
    let stopFn: (() => void) | undefined;

    reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (result && ativo) {
          ativo = false;
          stopFn?.();
          onDetected(result.getText());
        }
      })
      .then((controls) => {
        stopFn = () => controls.stop();
        if (!ativo) controls.stop();
      })
      .catch(() => {
        setErro('Não foi possível acessar a câmera. Verifique a permissão do navegador.');
      });

    return () => {
      ativo = false;
      stopFn?.();
    };
  }, [onDetected]);

  return (
    <div className="flex flex-col gap-3">
      {erro ? (
        <p className="text-sm text-danger">{erro}</p>
      ) : (
        <video ref={videoRef} className="w-full rounded-lg border border-border" muted playsInline />
      )}
      <button type="button" onClick={onFechar} className="text-sm text-muted underline w-fit">
        Cancelar leitura
      </button>
    </div>
  );
}
