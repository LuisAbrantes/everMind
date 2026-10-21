/* ============================================================================
   everMind Web — js/games/game-utils.js
   Utilidades puras e determinísticas dos minijogos novos (Pares, Complete o
   Ditado, Conta do Mercado, Ordem Certa). Carregado ANTES dos motores.

   Por que existe: os testes precisam de rodadas reproduzíveis. O embaralhamento
   com `Math.random` (usado pelo jogo de palavras, por fidelidade ao original,
   README §4.5) não é reproduzível; este usa um gerador com semente.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /** Gerador pseudoaleatório com semente (mulberry32). Devolve valores em [0, 1). */
  function seededRandom(seed) {
    var a = Math.floor(Number(seed) || 0) >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Fisher–Yates com semente: mesma semente, mesma ordem. Não altera `list`. */
  function seededShuffle(list, seed) {
    var out = list.slice();
    var random = seededRandom(seed);
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  EM.games = EM.games || {};
  EM.games.util = {
    seededRandom: seededRandom,
    seededShuffle: seededShuffle,
  };
})(window);
