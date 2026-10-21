/* ============================================================================
   everMind Web — js/domain/daily-triad-coordinator.js
   Portagem literal de `src/modules/daily-triad/DailyTriadCoordinator.ts`.

   A Tríade do Dia é DETERMINÍSTICA: a mesma data sempre gera exatamente as
   mesmas 3 desafios. Isso é uma decisão de domínio — o usuário não deve ver a
   lista mudar a cada reload do app.

   ── Algoritmo (idêntico ao original) ──────────────────────────────────────
     1. Hash "estilo Java" (String.hashCode) da string de data, em 32 bits.
        `seed = (seed << 5) - seed + charCode` equivale a `h*31 + c`.
        Em JS usamos Math.imul para evitar perda de precisão em float.
     2. Extrai 3 pilares DISTINTOS como dígitos em base 4 do hash:
        - p1 = absSeed % 4
        - p2 = floor(absSeed / 4) % 3   (sobre os 3 restantes)
        - p3 = floor(absSeed / 16) % 2  (sobre os 2 restantes)
        Como são dígitos diferentes da mesma base, os 3 são sempre distintos.
     3. Para cada pilar, escolhe UM desafio usando `absSeed % <tamanho do pilar>`
     ─ o MESMO absSeed nos três, não um valor incremental.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  /** Catálogo mestre de desafios — 10 entradas, todas com growthPoints: 10.
      Distribuição: MIND 3 · MOVEMENT 2 · SELFCARE 3 · CONNECTION 2. */
  var MASTER_CHALLENGE_CATALOG = [
    {
      id: 'mind_sequence_easy',
      pillar: 'MIND',
      title: 'Sequência Numérica',
      subtitle: 'Descubra o próximo número da sequência lógica e exercite seu raciocínio.',
      route: '/brain-gym/sequence',
      activityKey: 'game:sequence',
      growthPoints: 10,
    },
    {
      id: 'mind_memory_pairs',
      pillar: 'MIND',
      title: 'Memória Visual',
      subtitle: 'Encontre os 5 pares de figuras acolhedoras no seu tempo.',
      route: '/brain-gym/memory',
      activityKey: 'game:memory',
      growthPoints: 10,
    },
    {
      id: 'mind_word_puzzle',
      pillar: 'MIND',
      title: 'Formação de Palavras',
      subtitle: 'Descubra 3 palavras carinhosas com as letras propostas.',
      route: '/brain-gym/words',
      activityKey: 'game:words',
      growthPoints: 10,
    },
    {
      id: 'movement_walk_10min',
      pillar: 'MOVEMENT',
      title: 'Caminhada Suave de 10 min',
      subtitle: 'Dê passos confortáveis no quintal, na sala ou na calçada ao ar livre.',
      route: '/movement/walk',
      activityKey: 'walk',
      growthPoints: 10,
    },
    {
      id: 'movement_stretch_morning',
      pillar: 'MOVEMENT',
      title: 'Alongamento Matinal',
      subtitle: 'Cinco minutos de respiração e relaxamento para os ombros e coluna.',
      route: '/movement/stretch',
      activityKey: 'walk',
      growthPoints: 10,
    },
    {
      id: 'selfcare_water_glass',
      pillar: 'SELFCARE',
      title: 'Hora da Água',
      subtitle: 'Aprecie um copo cheio de água fresca para hidratar seu corpo.',
      route: '/selfcare/water',
      activityKey: 'water',
      growthPoints: 10,
    },
    {
      id: 'selfcare_fruit_snack',
      pillar: 'SELFCARE',
      title: 'Fruta ou Vegetal no Prato',
      subtitle: 'Saboreie uma porção de fruta fresca ou vegetal no lanche ou refeição.',
      route: '/selfcare/fruit',
      activityKey: 'fruit',
      growthPoints: 10,
    },
    {
      id: 'selfcare_relax_sleep',
      pillar: 'SELFCARE',
      title: 'Preparação para o Sono',
      subtitle: 'Desligue telas 30 minutos antes de dormir e desfrute de um chá morno.',
      route: '/selfcare/sleep',
      activityKey: 'sleep',
      growthPoints: 10,
    },
    {
      id: 'connection_call_loved_one',
      pillar: 'CONNECTION',
      title: 'Telefonema Acolhedor',
      subtitle: 'Ligue para um amigo ou familiar querido e pergunte: "Como foi o seu dia?"',
      route: '/connection/call',
      activityKey: 'call',
      growthPoints: 10,
    },
    {
      id: 'connection_kind_message',
      pillar: 'CONNECTION',
      title: 'Mensagem de Carinho',
      subtitle: 'Envie um áudio ou mensagem afetuosa de bom dia para alguém especial.',
      route: '/connection/message',
      activityKey: 'call',
      growthPoints: 10,
    },
  ];

  var ALL_PILLARS = ['MIND', 'MOVEMENT', 'SELFCARE', 'CONNECTION'];

  /** Hash 31 em 32 bits com sinal — equivalente a String.hashCode() do Java. */
  function javaStringHash(input) {
    var seed = 0;
    for (var i = 0; i < input.length; i++) {
      seed = (Math.imul(seed, 31) + input.charCodeAt(i)) | 0;
    }
    return seed;
  }

  /**
   * Gera a Tríade do Dia para uma data.
   * @param {string} dateString  "YYYY-MM-DD" (o app passa a data LOCAL)
   * @param {string[]} completedIds  ids já concluídos NAQUELA data
   * @returns {Array} exatamente 3 desafios, na ordem dos pilares sorteados
   */
  function generateTriadForDate(dateString, completedIds) {
    var completed = completedIds || [];
    var absSeed = Math.abs(javaStringHash(dateString));

    // ── 3 pilares distintos, extraídos como dígitos em base 4 do hash ─────
    var chosenPillars = [];
    var p1Index = absSeed % ALL_PILLARS.length;
    chosenPillars.push(ALL_PILLARS[p1Index]);

    var remaining1 = ALL_PILLARS.filter(function (pillar) {
      return pillar !== chosenPillars[0];
    });
    var p2Index = Math.floor(absSeed / 4) % remaining1.length;
    chosenPillars.push(remaining1[p2Index]);

    var remaining2 = remaining1.filter(function (pillar) {
      return pillar !== chosenPillars[1];
    });
    var p3Index = Math.floor(absSeed / 16) % remaining2.length;
    chosenPillars.push(remaining2[p3Index]);

    // ── Um desafio por pilar, usando o MESMO absSeed nos três ─────────────
    var triad = [];
    for (var i = 0; i < 3; i++) {
      var pillar = chosenPillars[i];
      var matching = MASTER_CHALLENGE_CATALOG.filter(function (challenge) {
        return challenge.pillar === pillar;
      });
      var challengeTemplate = matching[absSeed % matching.length];
      var isCompleted = completed.indexOf(challengeTemplate.id) >= 0;

      triad.push(
        Object.assign({}, challengeTemplate, {
          isCompleted: isCompleted,
          completedAt: isCompleted ? dateString : undefined,
        })
      );
    }

    return triad;
  }

  /* Jogo da Ginástica Cerebral citado na rota → id usado por brain-gym.js. */
  var GAME_FOR_ROUTE_SLUG = { sequence: 'SEQUENCE', memory: 'MEMORY', words: 'WORDS' };

  /**
   * Traduz a `route` de um desafio em { screen, params } para `EM.app.navigate`.
   * Quando a rota nomeia um jogo, `params.game` abre ESSE jogo direto; senão
   * apenas a aba. Tocar no cartão só NAVEGA — nunca conclui o desafio.
   */
  function resolveRoute(route) {
    var path = String(route || '');
    var slug = path.split('/').filter(Boolean)[1] || '';
    if (path.indexOf('brain-gym') >= 0) {
      var game = GAME_FOR_ROUTE_SLUG[slug];
      return { screen: 'BRAIN_GYM', params: game ? { game: game } : {} };
    }
    if (path.indexOf('movement') >= 0) return { screen: 'BODY_MOVEMENT', params: {} };
    if (path.indexOf('selfcare') >= 0) return { screen: 'SELF_CARE', params: {} };
    if (path.indexOf('connection') >= 0) return { screen: 'SOCIAL_CONNECTION', params: {} };
    return { screen: 'HOME', params: {} };
  }

  EM.domain = EM.domain || {};
  EM.domain.dailyTriadCoordinator = {
    resolveRoute: resolveRoute,
    MASTER_CHALLENGE_CATALOG: MASTER_CHALLENGE_CATALOG,
    javaStringHash: javaStringHash,
    generateTriadForDate: generateTriadForDate,
  };
})(window);
