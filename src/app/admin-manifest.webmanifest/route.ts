import { NextResponse } from 'next/server';

// Rota manual (não usa o convention file `app/manifest.ts`) porque essa
// convenção injeta o <link rel="manifest"> em toda a árvore de `app/`,
// inclusive no grupo (totem) — mas este manifest é só do operador. Aqui a
// URL é servida por um route handler comum e o <link> é adicionado
// explicitamente só no metadata do layout de (admin).
export function GET() {
  return NextResponse.json(
    {
      name: 'PDV de Eventos — Operador',
      short_name: 'PDV Operador',
      description: 'Painel do operador: caixa, vendas e catálogo do PDV de Eventos.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#faf8f5',
      theme_color: '#ea580c',
      icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  );
}
