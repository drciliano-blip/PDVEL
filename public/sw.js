// Marco 1 do caixa offline-first: instalabilidade PWA + fallback offline
// somente-leitura para as duas telas que o operador usa ao vivo no evento
// (/caixa e /venda). Sem Serwist/Workbox — o dev server deste projeto roda
// em Turbopack e o Serwist hoje exige configuração webpack, então este SW
// é escrito à mão para não introduzir esse risco de compatibilidade.
//
// Não faz cache de nada em /api, /totem ou /e — telas de status de
// pagamento nunca podem servir uma resposta antiga.

const SHELL_CACHE = 'pdv-admin-shell-v1';
const RUNTIME_CACHE = 'pdv-admin-runtime-v1';
const CACHE_ALLOWLIST = [SHELL_CACHE, RUNTIME_CACHE];

// Pathname exato, não prefixo: /venda/[id]/pix e /venda/[id]/recibo são
// telas de status de pagamento e devem sempre ir para a rede.
const OFFLINE_FALLBACK_PATHS = new Set(['/caixa', '/venda']);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !CACHE_ALLOWLIST.includes(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })()
  );
});

function isBypassed(url) {
  return url.pathname.startsWith('/api/') || url.pathname.startsWith('/totem/') || url.pathname.startsWith('/e/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isBypassed(url)) return;

  if (request.mode === 'navigate' && OFFLINE_FALLBACK_PATHS.has(url.pathname)) {
    event.respondWith(networkFirstNavigation(event, request));
    return;
  }

  if (['script', 'style', 'font', 'image'].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(event, request));
  }
});

async function networkFirstNavigation(event, request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) event.waitUntil(cache.put(request, response.clone()));
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw new Error('offline-and-uncached');
  }
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) event.waitUntil(cache.put(request, response.clone()));
      return response;
    })
    .catch(() => undefined);
  return cached ?? (await network) ?? Response.error();
}
