# Missão 05: Tela 7 — Minha Semana, Navegação Global & Sync Supabase

**Status:** ⏳ PENDENTE / PRONTO PARA EXECUÇÃO

## Contexto & Regras Obrigatórias
- **Skills a Usar:** `codebase-design`, `tdd`, `supabase`, `mobile-ui-ux-design`.
- **Regra de Ouro:** Retrospectiva Afirmativa e Sem Culpa (exibe apenas vitórias e somas cumulativas, nunca dias vazios em vermelho).
- **Design:** Black & White shadcn + Geist.

## Escopo:
1. **Tela 7: Minha Semana (`src/screens/WeeklySummaryScreen/`):**
   - Consolidação semanal dos 4 pilares:
     • *"X atividades mentais concluídas"*
     • *"Y dias em movimento"*
     • *"Z momentos de autocuidado"*
     • *"W conexões afetivas"*
   - Reforço positivo: *"Você está construindo bons hábitos no seu próprio ritmo!"*
   - Quadro de Medalhas / Conquistas desbloqueadas (Badges).
2. **Navegação Global do App (`src/navigation/` ou Expo Router):**
   - Barra inferior acessível conectando as 5 abas principais (Hoje, Cérebro, Hábitos, Conexão, Semana).
3. **Serviço de Sincronização em Nuvem (`src/modules/sync/SupabaseSyncCoordinator.ts`):**
   - Sincroniza em background os dados locais de `challenge_completions`, `virtual_brain_state` e `user_achievements` com o Supabase sem bloquear a UI.

## Entregáveis da Missão:
1. `src/modules/summary/WeeklySummaryCalculator.ts` com testes unitários.
2. `src/modules/sync/SupabaseSyncCoordinator.ts` com testes unitários.
3. `src/screens/WeeklySummaryScreen/` (`WeeklySummaryView.tsx`, `useWeeklySummary.ts`).
4. `src/navigation/RootNavigator.tsx` ou configuração do Expo Router.
5. Execução completa da suíte de testes com 100% de sucesso via `cmd /c npm test`.
