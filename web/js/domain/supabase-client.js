/* ============================================================================
   everMind Web — js/domain/supabase-client.js
   Adaptação de `src/lib/supabase.ts` para a web, SEM dependência de npm.

   ┌─ O que o app original faz ─────────────────────────────────────────────┐
   │  `createClient()` do pacote `@supabase/supabase-js`, com AsyncStorage  │
   │  como backend de token e um polyfill de URL.                          │
   └────────────────────────────────────────────────────────────────────────┘

   ┌─ Por que não usamos o SDK ─────────────────────────────────────────────┐
   │  O objetivo desta porta é HTML/CSS/JS puro, sem build e sem node_modules.│
   │  O único recurso que o app usa é um `upsert` (POST + Prefer:           │
   │  resolution=merge-duplicates), que é acessível direto pela REST API do  │
   │  PostgREST. Então implementamos só o necessário com `fetch`.            │
   │                                                                       │
   │  A porta também é 100% offline-first: sem URL/chave configurada, o     │
   │  cliente simplesmente reporta "não configurado" e a UI cai no modo     │
   │  local — nunca quebra o app.                                           │
   └────────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /* ── Configuração ────────────────────────────────────────────────────────
     Por segurança, um PWA NÃO deve embutir segredos. As credenciais são
     lidas de `config.js` (veja README) ou de `localStorage`, e o app funciona
     100% sem elas.
     ---------------------------------------------------------------------- */
  var injected = global.EVERMIND_CONFIG || {};

  var SUPABASE_URL = injected.supabaseUrl || null;
  var SUPABASE_KEY = injected.supabaseKey || null;

  function readOverride(key) {
    try {
      return global.localStorage ? global.localStorage.getItem(key) : null;
    } catch (error) {
      return null;
    }
  }

  SUPABASE_URL = SUPABASE_URL || readOverride('evermind:supabaseUrl');
  SUPABASE_KEY = SUPABASE_KEY || readOverride('evermind:supabaseKey');

  var configured = Boolean(SUPABASE_URL && SUPABASE_KEY);

  function headers() {
    return {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    };
  }

  /**
   * POST /rest/v1/<table>  — upsert de uma única linha.
   * @returns {Promise<{ok:boolean, status:number, body:any}>}
   */
  function upsert(table, payload, onConflict) {
    var url =
      String(SUPABASE_URL).replace(/\/+$/, '') +
      '/rest/v1/' +
      encodeURIComponent(table) +
      '?on_conflict=' +
      encodeURIComponent(onConflict);

    return global
      .fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(payload) })
      .then(function (response) {
        return response.text().then(function (bodyText) {
          var body = null;
          try {
            body = bodyText ? JSON.parse(bodyText) : null;
          } catch (error) {
            body = bodyText;
          }
          return { ok: response.ok, status: response.status, body: body };
        });
      });
  }

  function anonClient() {
    return {
      isConfigured: function () {
        return configured;
      },
      upsert: upsert,
    };
  }

  var supabase = {
    anon: anonClient(),
    // Mantém o nome `supabase` para espelhar o import do app original.
    from: function (table) {
      return {
        upsert: function (payload, options) {
          return upsert(table, payload, (options && options.onConflict) || 'id');
        },
      };
    },
    isConfigured: function () {
      return configured;
    },
  };

  EM.domain = EM.domain || {};
  EM.domain.supabaseClient = supabase;
})(window);
