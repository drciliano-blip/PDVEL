'use client';

function chave(eventoId: string): string {
  return `carteira:${eventoId}`;
}

export function listarVendasDaCarteira(eventoId: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const bruto = window.localStorage.getItem(chave(eventoId));
    if (!bruto) return [];
    const lista = JSON.parse(bruto);
    return Array.isArray(lista) ? lista.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export function adicionarVendaNaCarteira(eventoId: string, vendaId: string): void {
  if (typeof window === 'undefined') return;
  const atual = listarVendasDaCarteira(eventoId);
  if (atual.includes(vendaId)) return;
  window.localStorage.setItem(chave(eventoId), JSON.stringify([...atual, vendaId]));
}
