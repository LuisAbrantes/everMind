/* ============================================================================
   everMind Web — js/games/order-game-engine.js
   Jogo 9 — Ordem Certa: 4 passos embaralhados de uma rotina do dia a dia
   (fazer um café, plantar uma muda, trocar uma lâmpada…). O usuário toca nos
   passos NA ORDEM em que acontecem; cada toque mostra o número 1 a 4.

   Planejamento e sequenciamento — funções executivas — sem pressão:
     • DESFAZER tira o último passo escolhido;
     • se a ordem completa não está certa, vem um "Quase! Vamos tentar de
       novo" e RECOMEÇAR (nunca "zerar"); os números ficam à vista;
     • ordem certa conclui a rodada.

   Curadoria: cada rotina tem UMA ordem possível — cada passo só faz sentido
   depois do anterior (ex.: encher a chaleira → esperar ferver → passar a água
   → servir). Em `steps`, a ordem do vetor É a ordem certa.

   Motor puro e determinístico: `createRound(index, seed)`. Nos caminhos de
   "no-op" devolve o MESMO objeto de estado (README §4.6).
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});
  var util = EM.games.util;

  var STEP_COUNT = 4;

  var ROUTINES = [
    { id: 'cafe', title: 'fazer um café', steps: [
      'Encher a chaleira com água', 'Esperar a água ferver',
      'Passar a água quente no pó de café', 'Servir o café na xícara'] },
    { id: 'muda', title: 'plantar uma muda', steps: [
      'Cavar um buraco na terra', 'Colocar a muda no buraco',
      'Cobrir as raízes com terra', 'Regar a muda com água'] },
    { id: 'roupa', title: 'lavar roupa na máquina', steps: [
      'Colocar a roupa suja na máquina', 'Ligar a máquina de lavar',
      'Tirar a roupa limpa da máquina', 'Estender a roupa no varal'] },
    { id: 'lampada', title: 'trocar uma lâmpada', steps: [
      'Desligar a luz no interruptor', 'Tirar a lâmpada queimada',
      'Rosquear a lâmpada nova', 'Ligar o interruptor para testar'] },
    { id: 'bolo', title: 'fazer um bolo', steps: [
      'Separar os ingredientes', 'Misturar tudo na tigela',
      'Assar a massa no forno', 'Servir o bolo'] },
    { id: 'banho', title: 'tomar banho', steps: [
      'Ligar o chuveiro e molhar o corpo', 'Passar o sabonete no corpo',
      'Enxaguar o sabonete', 'Secar o corpo com a toalha'] },
    { id: 'carta', title: 'mandar uma carta', steps: [
      'Escrever a carta no papel', 'Colocar a carta no envelope',
      'Fechar o envelope e colar o selo', 'Deixar a carta no correio'] },
    { id: 'ligacao', title: 'ligar para alguém', steps: [
      'Procurar o nome na agenda do telefone', 'Tocar no nome para chamar',
      'Conversar com a pessoa', 'Desligar o telefone'] },
    { id: 'mesa', title: 'pôr a mesa do almoço', steps: [
      'Estender a toalha na mesa', 'Colocar os pratos sobre a toalha',
      'Colocar os talheres ao lado dos pratos', 'Trazer a comida para a mesa'] },
    { id: 'arroz', title: 'fazer arroz', steps: [
      'Lavar o arroz', 'Refogar o arroz com alho',
      'Juntar a água quente e deixar cozinhar', 'Servir o arroz no prato'] },
    { id: 'compras', title: 'fazer compras no mercado', steps: [
      'Fazer a lista de compras', 'Escolher os produtos nas prateleiras',
      'Pagar no caixa', 'Guardar as compras em casa'] },
    { id: 'suco', title: 'fazer suco de laranja', steps: [
      'Lavar as laranjas', 'Cortar as laranjas ao meio',
      'Espremer as laranjas', 'Servir o suco no copo'] },
    { id: 'louca', title: 'lavar a louça', steps: [
      'Tirar os restos de comida dos pratos', 'Ensaboar a louça com a esponja',
      'Enxaguar a louça com água', 'Deixar a louça secar no escorredor'] },
    { id: 'ovo', title: 'fritar um ovo', steps: [
      'Esquentar a frigideira com um fio de óleo', 'Quebrar o ovo na frigideira',
      'Esperar a clara firmar', 'Colocar o ovo no prato'] },
    { id: 'dentes', title: 'escovar os dentes', steps: [
      'Colocar pasta de dente na escova', 'Escovar todos os dentes',
      'Enxaguar a boca com água', 'Guardar a escova no lugar'] },
  ];

  /** Próxima rotina da rotação (nunca repete a atual de imediato). */
  function nextRoutineIndex(currentIndex) {
    return (Math.abs(currentIndex || 0) + 1) % ROUTINES.length;
  }

  /**
   * @param {number} routineIndex
   * @param {number} [seed]  padrão derivado do índice (rodada reproduzível)
   *
   * Cada passo exibido é `{ id, text }`, onde `id` é a posição CERTA (0 a 3).
   * A ordem exibida nunca é a ordem certa: sobraria nada a fazer.
   */
  function createRound(routineIndex, seed) {
    var safeIndex = Math.abs(routineIndex || 0) % ROUTINES.length;
    var routine = ROUTINES[safeIndex];
    var shuffleSeed = seed === undefined ? safeIndex * 13 + 1 : seed;

    var steps = routine.steps.map(function (text, position) {
      return { id: position, text: text };
    });
    var shown = util.seededShuffle(steps, shuffleSeed);
    var isAlreadyInOrder = shown.every(function (step, position) {
      return step.id === position;
    });
    if (isAlreadyInOrder) shown = shown.slice(1).concat(shown.slice(0, 1));

    return {
      routineIndex: safeIndex,
      routine: routine,
      steps: shown,
      pickedIds: [], // ids dos passos, na ordem em que foram tocados
      status: 'picking', // 'picking' | 'wrong' | 'complete'
      attempts: 0, // ordens completas já tentadas (só um número neutro)
      isComplete: false,
    };
  }

  /**
   * Toca num passo.
   * @returns {{nextState:object, outcome:'ignored'|'picked'|'wrong'|'complete'}}
   *   'ignored' → rodada concluída, ordem completa errada à espera de
   *               DESFAZER/RECOMEÇAR, passo inexistente ou já escolhido
   *               (MESMO objeto);
   *   'picked'  → passo escolhido (ainda faltam passos);
   *   'complete'→ o 4º passo fecha a ordem CERTA;
   *   'wrong'   → o 4º passo fecha uma ordem que ainda não é a certa.
   */
  function pickStep(state, stepId) {
    var exists = state.steps.some(function (step) { return step.id === stepId; });
    if (
      state.isComplete ||
      state.status === 'wrong' ||
      !exists ||
      state.pickedIds.indexOf(stepId) >= 0
    ) {
      return { nextState: state, outcome: 'ignored' };
    }

    var picked = state.pickedIds.concat([stepId]);
    if (picked.length < STEP_COUNT) {
      return {
        nextState: Object.assign({}, state, { pickedIds: picked }),
        outcome: 'picked',
      };
    }

    var isRight = picked.every(function (id, position) {
      return id === position;
    });
    if (isRight) {
      return {
        nextState: Object.assign({}, state, {
          pickedIds: picked,
          status: 'complete',
          attempts: state.attempts + 1,
          isComplete: true,
        }),
        outcome: 'complete',
      };
    }
    return {
      nextState: Object.assign({}, state, {
        pickedIds: picked,
        status: 'wrong',
        attempts: state.attempts + 1,
      }),
      outcome: 'wrong',
    };
  }

  /** Tira o último passo escolhido. No-op (mesmo objeto) sem passos ou com a rodada concluída. */
  function undoLastPick(state) {
    if (state.isComplete || state.pickedIds.length === 0) return state;
    return Object.assign({}, state, {
      pickedIds: state.pickedIds.slice(0, -1),
      status: 'picking',
    });
  }

  /** RECOMEÇAR: limpa todos os passos escolhidos. No-op sem passos ou com a rodada concluída. */
  function restart(state) {
    if (state.isComplete || state.pickedIds.length === 0) return state;
    return Object.assign({}, state, { pickedIds: [], status: 'picking' });
  }

  EM.games = EM.games || {};
  EM.games.order = {
    ROUTINES: ROUTINES,
    STEP_COUNT: STEP_COUNT,
    createRound: createRound,
    pickStep: pickStep,
    undoLastPick: undoLastPick,
    restart: restart,
    nextRoutineIndex: nextRoutineIndex,
  };
})(window);
