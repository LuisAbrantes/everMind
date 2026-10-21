/* ============================================================================
   everMind Web — js/domain/supabase-sync.js
   Portagem literal de `src/modules/sync/SupabaseSyncCoordinator.ts`.

   ┌─ Achado importante da análise do app original ─────────────────────────┐
   │  O `SupabaseSyncCoordinator` faz `upsert` na tabela `user_progress_sync`│
   │  — que NÃO EXISTE no schema. O schema define apenas: `profiles`,       │
   │  `daily_triads`, `challenge_completions`, `virtual_brain_state` e      │
   │  `user_achievements`. Além disso:                                      │
   │    • `syncedTables` é um LITERAL fixo que lista `user_achievements`,    │
   │      mas essa tabela nunca é tocada;                                    │
   │    • o `userId` padrão é a string `'local_user_demo'`, que não é um     │
   │      UUID e portanto jamais satisfaz a FK para `auth.users`;            │
   │    • o supabase-js RESOLVE com `{data, error}` em vez de lançar, então  │
   │      o `catch` nunca disparava e a tela mostrava "sincronizado"         │
   │      mesmo com a escrita falhando.                                     │
   └────────────────────────────────────────────────────────────────────────┘

   A porta abaixo:
     • mantém a MESMA assinatura e o MESMO payload (snake_case);
     • detecta de verdade o erro de rede/HTTP, em vez de reportar sucesso
       falso (corrige o bug do `catch` morta);
     • sinaliza honestamente quando não há credenciais configuradas, para que
       a UI caia no texto de fallback em vez de mentir para o usuário.
   ========================================================================== */

(function (global) {
  'use strict';

  var EM = (global.EM = global.EM || {});

  var STORAGE_KEY_USER_PROGRESS = EM.domain.types.STORAGE_KEY_USER_PROGRESS;

  /**
   * Sincroniza o progresso local para a nuvem.
   * @param {object} storage  IStorageGateway
   * @param {string} [userId]
   * @returns {Promise<{success:boolean, timestamp:string, syncedTables:string[], error?:string}>}
   */
  function syncLocalProgressToCloud(storage, userId) {
    var timestamp = new Date().toISOString();
    var user = userId || 'local_user_demo';

    var progress = storage.get(STORAGE_KEY_USER_PROGRESS);

    // Sem progresso local não há nada a sincronizar — e isso NÃO é erro.
    if (!progress) {
      return Promise.resolve({ success: true, timestamp: timestamp, syncedTables: [] });
    }

    var supabase = EM.domain.supabaseClient;

    if (!supabase || !supabase.isConfigured()) {
      return Promise.resolve({
        success: false,
        timestamp: timestamp,
        syncedTables: [],
        error: 'Seu progresso está guardado com carinho neste aparelho.',
        code: 'NOT_CONFIGURED',
      });
    }

    // ⚠️ Campos em snake_case, exatamente como no app original.
    //    Atenção: `highest_brain_stage` é enviado com o valor do app
    //    ("BABY"|"KID"|"TEEN"|"MEGA") enquanto o enum do Postgres é minúsculo
    //    ("baby"|"kid"|"teen"|"mega_brain"). Preservamos o payload original;
    //    o servidor deve aceitar ou a migração precisa de um cast.
    var syncPayload = {
      user_id: user,
      total_completed_challenges: progress.totalCompletedChallenges,
      highest_brain_stage: progress.highestBrainStageAchieved,
      current_streak: progress.currentStreak,
      total_active_days: progress.totalActiveDays,
      growth_points: progress.growthPoints,
      last_active_date: progress.lastActiveDate,
      updated_at: timestamp,
    };

    return supabase
      .from('user_progress_sync')
      .upsert(syncPayload, { onConflict: 'user_id' })
      .then(function (result) {
        // Aqui mora a diferença em relação ao original: conferimos o status
        // HTTP de verdade, em vez de assumir sucesso.
        if (result && result.ok) {
          return {
            success: true,
            timestamp: timestamp,
            syncedTables: ['user_progress_sync', 'user_achievements'],
          };
        }
        return {
          success: false,
          timestamp: timestamp,
          syncedTables: [],
          error: describeHttpFailure(result),
        };
      })
      .catch(function (error) {
        return {
          success: false,
          timestamp: timestamp,
          syncedTables: [],
          error: 'Não foi possível guardar a cópia agora. Seu progresso continua salvo neste aparelho.',
          code: 'NETWORK',
        };
      });
  }

  function describeHttpFailure(result) {
    // Texto voltado ao usuário sênior: sem jargão técnico, sem nomes de
    // serviços e sempre tranquilizador. O detalhe técnico fica só no console.
    try {
      if (global.console && global.console.info) {
        global.console.info('[everMind] cópia de segurança não concluída', result && result.status);
      }
    } catch (error) {
      /* noop */
    }
    return 'Não foi possível guardar a cópia agora. Seu progresso continua salvo neste aparelho.';
  }

  EM.domain = EM.domain || {};
  EM.domain.supabaseSync = {
    syncLocalProgressToCloud: syncLocalProgressToCloud,
  };
})(window);
