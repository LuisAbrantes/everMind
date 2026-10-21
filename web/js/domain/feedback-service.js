/* ============================================================================
   everMind Web — js/domain/feedback-service.js
   Portagem de `src/modules/feedback/*`.

   ┌─ O que o app original faz ─────────────────────────────────────────────┐
   │  `IFeedbackService` (ADR-0005) prevê áudio suave, háptica e celebração │
   │  visual. Mas NENHUMA implementação de produção existe no repositório:   │
   │  todos os hooks instanciam `MockFeedbackService`, que apenas incrementa │
   │  contadores. Ou seja, no app real TODO o feedback é inerte.            │
   └────────────────────────────────────────────────────────────────────────┘

   ┌─ O que fazemos na web ────────────────────────────────────────────────┐
   │  Mantivemos a MESMA interface de 3 métodos e o MESMO papel de Mock     │
   │  (guardam contadores, usados nos testes), mas aproveitamos a seam para  │
   │  entregar o feedback que o ADR previa:                                │
   │    • triggerSuccessFeedback      → vibração curta + sinal positivo     │
   │    • triggerSelectFeedback       → micro-toque de seleção             │
   │    • triggerGentleNoticeFeedback → vibração leve de aviso              │
   │  Nenhum dos três inventa tela, texto punitivo ou bloqueio. A vibração │
   │  é pulada quando o sistema pede `prefers-reduced-motion` ou quando o   │
   │  navegador não suporta a Vibration API.                                │
   └────────────────────────────────────────────────────────────────────────┘
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  function prefersReducedMotion() {
    try {
      return (
        global.matchMedia &&
        global.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    } catch (error) {
      return false;
    }
  }

  /* ------------------------------------------------------------------------
     Preferências de Ajustes (sem dependência de EM.app, que carrega depois).
     Chaves no gateway: settings_sound / settings_vibration (booleanos).
     Padrão: ligado. Qualquer falha de leitura = ligado.
     ---------------------------------------------------------------------- */
  function readPref(key) {
    try {
      var value = EM.storage.gateway.get(key);
      return value !== false;
    } catch (error) {
      return true;
    }
  }
  function soundEnabled() { return readPref('settings_sound'); }
  function vibrationEnabled() { return readPref('settings_vibration'); }

  /* Toda vibração do app (inclusive a de EM.app e a dos serviços) passa pelo
     interruptor de Ajustes e por prefers-reduced-motion. */
  var rawVibrate = EM.vibrate;
  EM.vibrate = function (pattern) {
    if (!vibrationEnabled() || prefersReducedMotion()) return;
    if (typeof rawVibrate === 'function') rawVibrate(pattern);
  };

  /* =========================================================================
     ÁUDIO — Web Audio, criado sob demanda
     • O AudioContext só nasce no primeiro gesto do usuário (política de
       autoplay; no iOS precisa ser criado/retomado DENTRO do gesto).
     • Só ondas senoidais com ataque/queda suaves: nada de buzina.
     • `playNotes` é a API pública para o motor do jogo musical:

         EM.audio.playNotes(
           [{ note: 'C4', beats: 1 }, { note: 'E4', beats: 0.5 }, { note: null, beats: 0.5 },
            { freq: 440, dur: 0.3 }],
           { bpm: 90, volume: 0.2, onEnd: function () {} }
         ) → { stop() }

       - `note`: 'C4', 'F#3', 'Bb4' (oitava obrigatória); null/'R' = pausa.
       - duração: `beats` (com `bpm`, padrão 90) ou `dur` em segundos.
       - `onEnd` dispara ao terminar OU ao chamar `stop()`, e dispara mesmo
         com o som desligado em Ajustes (o jogo segue no mesmo ritmo, mudo).
       - `EM.audio.stopAll()` interrompe tudo que estiver tocando.
     ======================================================================= */
  var ctx = null;
  var active = [];

  function getContext() {
    if (ctx) return ctx;
    var Ctor = global.AudioContext || global.webkitAudioContext;
    if (!Ctor) return null;
    try { ctx = new Ctor(); } catch (error) { ctx = null; }
    return ctx;
  }

  /** Cria/retoma o contexto e toca 1 amostra muda (destrava o iOS). */
  function unlock() {
    var c = getContext();
    if (!c) return;
    try {
      if (c.state === 'suspended' && c.resume) c.resume();
      var buffer = c.createBuffer(1, 1, 22050);
      var src = c.createBufferSource();
      src.buffer = buffer;
      src.connect(c.destination);
      src.start(0);
    } catch (error) { /* noop */ }
  }

  ['pointerdown', 'touchend', 'keydown', 'click'].forEach(function (type) {
    global.document.addEventListener(type, unlock, { capture: true, passive: true });
  });

  var SEMITONES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function noteToFreq(note) {
    var m = /^([A-Ga-g])([#b♯♭]?)(-?\d)$/.exec(String(note || ''));
    if (!m) return null;
    var n = SEMITONES[m[1].toUpperCase()];
    if (m[2] === '#' || m[2] === '♯') n += 1;
    else if (m[2]) n -= 1;
    var midi = 12 * (parseInt(m[3], 10) + 1) + n;
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function noteSpec(item, bpm) {
    var freq = item.freq != null ? Number(item.freq) : noteToFreq(item.note);
    var dur = item.dur != null ? Number(item.dur) : (Number(item.beats) || 1) * 60 / bpm;
    if (!(dur > 0)) dur = 0.25;
    return { freq: freq > 0 ? freq : null, dur: dur };
  }

  function playNotes(notes, opts) {
    opts = opts || {};
    var bpm = Number(opts.bpm) > 0 ? Number(opts.bpm) : 90;
    var peak = opts.volume != null ? Math.max(0, Math.min(0.4, Number(opts.volume))) : 0.16;
    var list = (notes || []).map(function (n) { return noteSpec(n || {}, bpm); });
    var total = list.reduce(function (sum, n) { return sum + n.dur; }, 0);

    var handle = { stopped: false, ended: false, nodes: [], timer: null };
    function finish() {
      if (handle.ended) return;
      handle.ended = true;
      if (handle.timer) global.clearTimeout(handle.timer);
      var i = active.indexOf(handle);
      if (i >= 0) active.splice(i, 1);
      if (typeof opts.onEnd === 'function') {
        try { opts.onEnd(); } catch (error) { /* noop */ }
      }
    }

    var c = soundEnabled() && list.length ? getContext() : null;
    if (c) {
      try {
        if (c.state === 'suspended' && c.resume) c.resume();
        var t = c.currentTime + 0.03;
        list.forEach(function (n) {
          if (n.freq) {
            var osc = c.createOscillator();
            var gain = c.createGain();
            osc.type = 'sine';
            osc.frequency.value = n.freq;
            var attack = Math.min(0.02, n.dur / 4);
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.linearRampToValueAtTime(peak, t + attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + n.dur * 0.98);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(t);
            osc.stop(t + n.dur);
            handle.nodes.push({ osc: osc, gain: gain });
          }
          t += n.dur;
        });
      } catch (error) { /* silêncio é um resultado aceitável */ }
    }

    handle.stop = function () {
      if (handle.stopped) return;
      handle.stopped = true;
      handle.nodes.forEach(function (n) {
        try {
          n.gain.gain.cancelScheduledValues(0);
          n.gain.gain.setValueAtTime(0.0001, 0);
          n.osc.stop(0);
        } catch (error) { /* noop */ }
      });
      finish();
    };
    active.push(handle);
    handle.timer = global.setTimeout(finish, Math.round(total * 1000) + 60);
    return { stop: handle.stop };
  }

  function stopAll() {
    active.slice().forEach(function (h) { h.stop(); });
  }

  /* Sons do app: curtos, graves-médios, volume baixo. */
  function playSuccess() {
    // dois toques curtos e ascendentes (E5 → A5)
    playNotes([{ freq: 659.25, dur: 0.13 }, { freq: 880, dur: 0.22 }], { volume: 0.14 });
  }
  function playTryAgain() {
    // um único tom baixo e macio (D4), sem queda dramática: neutro, não é erro
    playNotes([{ freq: 293.66, dur: 0.32 }], { volume: 0.1 });
  }
  function playStageUp() {
    // arpejo de 3 notas (C5 E5 G5), a última mais longa
    playNotes(
      [{ freq: 523.25, dur: 0.16 }, { freq: 659.25, dur: 0.16 }, { freq: 783.99, dur: 0.45 }],
      { volume: 0.15 }
    );
  }

  EM.audio = {
    playNotes: playNotes,
    stopAll: stopAll,
    noteToFreq: noteToFreq,
    playSuccess: playSuccess,
    playTryAgain: playTryAgain,
    playStageUp: playStageUp,
    unlock: unlock,
    isSoundEnabled: soundEnabled,
    isVibrationEnabled: vibrationEnabled,
  };

  /* ---- IFeedbackService (3 métodos, ADR-0005) ---------------------------- */
  function WebFeedbackService() {
    this.successFeedbackCount = 0;
    this.selectFeedbackCount = 0;
    this.gentleNoticeFeedbackCount = 0;
  }

  WebFeedbackService.prototype.triggerSuccessFeedback = function () {
    this.successFeedbackCount += 1;
    EM.vibrate([12]);
    playSuccess();
  };

  WebFeedbackService.prototype.triggerSelectFeedback = function () {
    this.selectFeedbackCount += 1;
    EM.vibrate(6); // seleção é só tátil: som a cada toque cansaria
  };

  WebFeedbackService.prototype.triggerGentleNoticeFeedback = function () {
    this.gentleNoticeFeedbackCount += 1;
    EM.vibrate([8, 40, 8]);
    playTryAgain();
  };

  WebFeedbackService.prototype.reset = function () {
    this.successFeedbackCount = 0;
    this.selectFeedbackCount = 0;
    this.gentleNoticeFeedbackCount = 0;
  };

  /** Versão inerte, útil em testes automatizados. */
  function MockFeedbackService() {
    WebFeedbackService.call(this);
  }
  MockFeedbackService.prototype = Object.create(WebFeedbackService.prototype);
  MockFeedbackService.prototype.constructor = MockFeedbackService;
  MockFeedbackService.prototype.triggerSuccessFeedback = function () { this.successFeedbackCount += 1; };
  MockFeedbackService.prototype.triggerSelectFeedback = function () { this.selectFeedbackCount += 1; };
  MockFeedbackService.prototype.triggerGentleNoticeFeedback = function () { this.gentleNoticeFeedbackCount += 1; };

  EM.domain = EM.domain || {};
  EM.domain.feedback = {
    WebFeedbackService: WebFeedbackService,
    MockFeedbackService: MockFeedbackService,
  };

  /* =========================================================================
     Celebração de evolução (sem confete): cartão calmo, dispensável por
     "Continuar", some sozinho em 6 s. Sem animação com movimento reduzido.
     Substitui o aviso de EM.app.announceBrainStageChange.
     ======================================================================= */
  var celebrationTimer = null;
  function closeCelebration(layer, returnFocus) {
    if (celebrationTimer) { global.clearTimeout(celebrationTimer); celebrationTimer = null; }
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    if (returnFocus && returnFocus.focus && global.document.contains(returnFocus)) {
      try { returnFocus.focus({ preventScroll: true }); } catch (error) { /* noop */ }
    }
  }

  function showStageCelebration(config) {
    var h = EM.dom.h;
    var old = global.document.getElementById('stage-celebration');
    if (old) closeCelebration(old);
    var previous = global.document.activeElement;
    var layer;
    var btn = h('button', {
      type: 'button',
      class: 'btn btn-md btn-v-default stage-celebration-btn',
      onClick: function () { closeCelebration(layer, previous); },
    }, 'Continuar');
    layer = h('div', { id: 'stage-celebration', class: 'stage-celebration' },
      h('div', {
        class: 'stage-celebration-card', role: 'dialog', 'aria-modal': 'true',
        'aria-labelledby': 'stage-celebration-title',
      },
        h('p', { class: 'stage-celebration-emoji', 'aria-hidden': 'true' }, config.emoji || '🌱'),
        h('h2', { id: 'stage-celebration-title', class: 'stage-celebration-title' }, 'Seu cérebro evoluiu!'),
        h('p', { class: 'stage-celebration-text' }, 'Agora ele é ' + config.label + '.'),
        btn
      )
    );
    global.document.body.appendChild(layer);
    EM.announce('Seu cérebro evoluiu! Agora ele é ' + config.label + '.');
    btn.focus({ preventScroll: true });
    playStageUp();
    EM.vibrate([18, 60, 18]);
    celebrationTimer = global.setTimeout(function () { closeCelebration(layer, previous); }, 6000);
  }
  EM.celebrateStageUp = showStageCelebration;

  function hookApp() {
    var app = EM.app;
    if (!app || app.__stageHooked) return;
    app.__stageHooked = true;
    app.announceBrainStageChange = function (previousStage, nextStage, config) {
      if (!config || previousStage === nextStage) return;
      var order = EM.domain.brainEvolutionEngine.STAGE_ORDER;
      if (order.indexOf(nextStage) <= order.indexOf(previousStage)) return;
      showStageCelebration(config);
    };
  }
  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', hookApp);
  } else {
    hookApp();
  }
})(window);
