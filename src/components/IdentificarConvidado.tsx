'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Scanner } from '@/components/Scanner';
import { buscarConvidadoAction, criarConvidadoAction } from '@/app/(admin)/venda/convidado-actions';
import type { Convidado } from '@/lib/data/types';

interface IdentificarConvidadoProps {
  clienteId: string;
  eventoId: string;
  onConvidadoChange: (convidado: Convidado | null) => void;
}

export function IdentificarConvidado({
  clienteId,
  eventoId,
  onConvidadoChange,
}: IdentificarConvidadoProps) {
  const [isPending, startTransition] = useTransition();
  const [cpf, setCpf] = useState('');
  const [cartao, setCartao] = useState('');
  const [scannerAberto, setScannerAberto] = useState(false);
  const [convidado, setConvidado] = useState<Convidado | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [nomeNovo, setNomeNovo] = useState('');
  const [telefoneNovo, setTelefoneNovo] = useState('');
  const [emailNovo, setEmailNovo] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const exigeConsentimento = !!(cpf || telefoneNovo || emailNovo);

  function buscar(cartaoLido?: string) {
    const numeroCartao = cartaoLido ?? cartao;
    setErro(null);
    setNaoEncontrado(false);
    if (!cpf && !numeroCartao) {
      setErro('Informe o CPF ou o número do cartão de consumo.');
      return;
    }
    startTransition(async () => {
      const encontrado = await buscarConvidadoAction({
        clienteId,
        cpf: cpf || undefined,
        numeroCartaoConsumo: numeroCartao || undefined,
      });
      if (encontrado) {
        setConvidado(encontrado);
        onConvidadoChange(encontrado);
      } else {
        setNaoEncontrado(true);
      }
    });
  }

  function cadastrar() {
    setErro(null);
    if (exigeConsentimento && !consentimento) {
      setErro('Para salvar CPF, telefone ou e-mail é preciso o consentimento do convidado.');
      return;
    }
    startTransition(async () => {
      const novo = await criarConvidadoAction({
        clienteId,
        eventoId,
        nome: nomeNovo || null,
        cpf: cpf || null,
        telefone: telefoneNovo || null,
        email: emailNovo || null,
        numeroCartaoConsumo: cartao || null,
        consentimentoLgpd: consentimento,
      });
      setConvidado(novo);
      setNaoEncontrado(false);
      onConvidadoChange(novo);
    });
  }

  function limpar() {
    setConvidado(null);
    setCpf('');
    setCartao('');
    setNaoEncontrado(false);
    setNomeNovo('');
    setTelefoneNovo('');
    setEmailNovo('');
    setConsentimento(false);
    setErro(null);
    onConvidadoChange(null);
  }

  if (convidado) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-accent/40 bg-surface-muted px-4 py-3">
        <div>
          <p className="text-sm font-medium">{convidado.nome ?? 'Convidado identificado'}</p>
          <p className="text-xs text-muted">
            {convidado.cpf ? `CPF final ${convidado.cpf.slice(-2)}` : convidado.numeroCartaoConsumo}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={limpar}>
          Trocar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border-2 border-dashed border-accent/50 bg-accent/5 p-4">
      <div>
        <p className="text-sm font-semibold">Identificar convidado (opcional)</p>
        <p className="text-xs text-muted">
          Busque por CPF, número do cartão de consumo, ou leia pela câmera.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-36"
        />
        <Input
          placeholder="Nº do cartão de consumo"
          value={cartao}
          onChange={(e) => setCartao(e.target.value)}
          className="w-48"
        />
        <Button type="button" variant="secondary" size="sm" disabled={isPending} onClick={() => buscar()}>
          Buscar
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setScannerAberto(true)}>
          📷 Ler pela câmera
        </Button>
      </div>

      {scannerAberto && (
        <Scanner
          onDetected={(valor) => {
            setScannerAberto(false);
            setCartao(valor);
            buscar(valor);
          }}
          onFechar={() => setScannerAberto(false)}
        />
      )}

      {erro && <p className="text-sm text-danger">{erro}</p>}

      {naoEncontrado && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-sm text-muted">Convidado não encontrado. Cadastrar novo:</p>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Nome (opcional)"
              value={nomeNovo}
              onChange={(e) => setNomeNovo(e.target.value)}
              className="w-48"
            />
            <Input
              placeholder="Telefone (opcional)"
              value={telefoneNovo}
              onChange={(e) => setTelefoneNovo(e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="E-mail (opcional)"
              type="email"
              value={emailNovo}
              onChange={(e) => setEmailNovo(e.target.value)}
              className="w-56"
            />
          </div>
          {exigeConsentimento && (
            <label className="flex items-start gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={consentimento}
                onChange={(e) => setConsentimento(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                Li e concordo com a{' '}
                <a href="/privacidade" target="_blank" className="underline">
                  Política de Privacidade
                </a>{' '}
                para o armazenamento desses dados.
              </span>
            </label>
          )}
          <Button type="button" size="sm" disabled={isPending} onClick={cadastrar} className="w-fit">
            Cadastrar e usar
          </Button>
        </div>
      )}
    </div>
  );
}
