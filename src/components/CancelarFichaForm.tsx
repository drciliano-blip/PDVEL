'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Scanner } from '@/components/Scanner';
import { buscarFichaAction } from '@/app/(admin)/fichas/resgatar/actions';
import { cancelarFichaAction } from '@/app/(admin)/eventos/[eventoId]/fichas/actions';
import type { Ficha } from '@/lib/data/types';

const STATUS_LABEL = {
  emitida: 'Pronta para retirada',
  resgatada: 'Já resgatada',
  cancelada: 'Cancelada',
} as const;

export function CancelarFichaForm({ operadorPadrao }: { operadorPadrao: string }) {
  const [isPending, startTransition] = useTransition();
  const [codigo, setCodigo] = useState('');
  const [operador, setOperador] = useState(operadorPadrao);
  const [motivo, setMotivo] = useState('');
  const [scannerAberto, setScannerAberto] = useState(false);
  const [ficha, setFicha] = useState<Ficha | null | undefined>(undefined);
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function buscar(codigoLido?: string) {
    const valor = (codigoLido ?? codigo).trim();
    setErro(null);
    setConfirmado(false);
    if (!valor) {
      setErro('Digite ou leia o código da ficha.');
      return;
    }
    startTransition(async () => {
      const encontrada = await buscarFichaAction(valor);
      setFicha(encontrada);
    });
  }

  function confirmarCancelamento() {
    if (!ficha) return;
    if (!operador.trim() || !motivo.trim()) {
      setErro('Informe quem está cancelando e o motivo.');
      return;
    }
    startTransition(async () => {
      try {
        const sucesso = await cancelarFichaAction(ficha.id, operador.trim(), motivo.trim());
        if (sucesso) {
          setConfirmado(true);
          setFicha({ ...ficha, status: 'cancelada' });
        } else {
          setErro('Essa ficha não pôde ser cancelada — provavelmente já foi resgatada ou cancelada.');
        }
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao cancelar a ficha.');
      }
    });
  }

  function novaLeitura() {
    setCodigo('');
    setFicha(undefined);
    setConfirmado(false);
    setErro(null);
    setMotivo('');
  }

  return (
    <div className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Código da ficha"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          className="w-40 font-mono tracking-widest"
        />
        <Button type="button" disabled={isPending} onClick={() => buscar()}>
          Buscar
        </Button>
        <Button type="button" variant="secondary" onClick={() => setScannerAberto(true)}>
          📷 Ler pela câmera
        </Button>
      </div>

      {scannerAberto && (
        <Scanner
          onDetected={(valor) => {
            setScannerAberto(false);
            setCodigo(valor.toUpperCase());
            buscar(valor);
          }}
          onFechar={() => setScannerAberto(false)}
        />
      )}

      {erro && <p className="text-sm text-danger">{erro}</p>}

      {ficha === null && <p className="text-sm text-muted">Nenhuma ficha encontrada com esse código.</p>}

      {ficha && (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{ficha.nomeProduto}</p>
            <Badge tone={ficha.status === 'emitida' ? 'success' : ficha.status === 'resgatada' ? 'neutral' : 'danger'}>
              {STATUS_LABEL[ficha.status]}
            </Badge>
          </div>

          {ficha.status === 'emitida' && !confirmado && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Cancelado por</label>
                <Input value={operador} onChange={(e) => setOperador(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted">Motivo</label>
                <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </div>
              <Button type="button" variant="danger" disabled={isPending} onClick={confirmarCancelamento} className="w-fit">
                Confirmar cancelamento
              </Button>
            </>
          )}

          {confirmado && <p className="text-sm text-success">Ficha cancelada!</p>}

          <Button type="button" variant="ghost" size="sm" onClick={novaLeitura} className="w-fit">
            Ler outra ficha
          </Button>
        </div>
      )}
    </div>
  );
}
