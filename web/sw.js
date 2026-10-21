/* ============================================================================
   everMind Web — sw.js
   Service worker da PWA: cache-first para o app shell.

   Estratégia
   ──────────
   • Navegações e recursos do próprio app → servidos do cache (offline-first).
   • Fontes do Google → cache tolerante a falha; se a rede falhar, o app
     continua legível com a pilha de fontes do sistema.
   • Requisições de terceiros (Supabase) → NUNCA são cacheadas. Sincronizar
     progresso é uma escrita; serv-la do cache seria mentir para o usuário.

   Como limpar o cache ao desenvolver:
     DevTools → Application → Service Workers → "Unregister", ou
     acrescente `?v=2` aos scripts no index.html.
   ========================================================================== */

/* Troque a versão a cada deploy: o activate apaga os caches antigos. */
var CACHE_NAME = 'evermind-2026-10-21c';

/* O app shell completo. `index.html` entra para que a navegação offline
   funcione mesmo em cold start. */
var APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',

  './css/fonts.css',
  './fonts/geist-latin.woff2',
  './fonts/geist-mono-latin.woff2',
  './css/tokens.css',
  './css/components.css',
  './css/utilities.css',
  './css/screens.css',
  './css/settings.css',

  './js/core/dom.js',
  './js/core/storage.js',
  './js/core/store.js',

  './js/domain/types.js',
  './js/domain/brain-evolution-engine.js',
  './js/domain/gentle-streak-manager.js',
  './js/domain/badge-evaluator.js',
  './js/domain/daily-triad-coordinator.js',
  './js/domain/habits-coordinator.js',
  './js/domain/social-coordinator.js',
  './js/domain/discovery-engine.js',
  './js/domain/weekly-summary-calculator.js',
  './js/domain/feedback-service.js',
  './js/domain/supabase-client.js',
  './js/domain/supabase-sync.js',

  './js/games/memory-game-engine.js',
  './js/games/sequence-game-engine.js',
  './js/games/words-game-engine.js',
  './js/games/attention-game-engine.js',
  './js/games/music-game-engine.js',

  './js/ui/components.js',

  './js/screens/home.js',
  './js/screens/brain-gym.js',
  './js/screens/body-movement.js',
  './js/screens/self-care.js',
  './js/screens/social-connection.js',
  './js/screens/discovery.js',
  './js/screens/weekly-summary.js',
  './js/screens/more.js',
  './js/screens/settings.js',
  './js/screens/onboarding.js',

  './js/pwa.js',
  './js/app.js',

  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // `addAll` falha inteiro se um único recurso faltar. Adicionamos um a
      // um para que um ícone ausente nunca impeça a instalação do app.
      return Promise.all(
        APP_SHELL.map(function (url) {
          return cache.add(new Request(url, { cache: 'reload' })).catch(function () {
            return null;
          });
        })
      );
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.map(function (name) {
          if (name !== CACHE_NAME) return caches.delete(name);
          return null;
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  // Nunca intercepta chamadas de API — são escritas de verdade.
  if (url.pathname.indexOf('/rest/v1/') >= 0) return;

  // Navegação: responde com o index.html cacheado (app shell).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put('./index.html', copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match('./index.html').then(function (cached) {
            return cached || caches.match('./');
          });
        })
    );
    return;
  }

  var isSameOrigin = url.origin === self.location.origin;
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (!isSameOrigin && !isFont) return;

  // Cache-first com atualização em segundo plano.
  event.respondWith(
    caches.match(request).then(function (cached) {
      var network = fetch(request, isSameOrigin ? { cache: 'no-cache' } : undefined)
        .then(function (response) {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(function () {
          return cached;
        });

      return cached || network;
    })
  );
});
