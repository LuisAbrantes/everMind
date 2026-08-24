# Missão 03: Telas 3 e 4 — Hábitos Somáticos (Mexa o Corpo & Cuide de Você)

**Status:** ⏳ PENDENTE / PRONTO PARA EXECUÇÃO

## Contexto & Regras Obrigatórias
- **Skills a Usar:** `codebase-design`, `tdd`, `mobile-ui-ux-design`.
- **Acessibilidade & Ergonomia:** Confirmações grandes, feedback acolhedor e persistência local imediata.
- **Design:** Black & White shadcn + Geist.

## Escopo das Telas:
1. **Tela 3: Mexa o Corpo (`src/screens/BodyMovementScreen/`):**
   - Desafio: Caminhada leve de 10 minutos (na rua, quintal ou dentro de casa).
   - Timer opcional suave (sem alarme estridente, apenas acompanhamento compassivo).
   - Botão de ação robusto `[ CONCLUÍDO ]` com feedback háptico e pontuação no pilar `movement`.
2. **Tela 4: Cuide de Você (`src/screens/SelfCareScreen/`):**
   - 3 Micro-missões essenciais do autocuidado:
     • 🥕 Missão da Refeição: Acrescentar fruta ou vegetal colorido (`[ CONCLUÍDO ]`).
     • 💧 Hora da Água: Registro rápido de hidratação diária (`[ SIM ]`).
     • 😴 Higiene do Sono: Lembrete gentil de manter horário habitual de dormir.
   - Estado salvo no pilar `selfcare`.

## Entregáveis da Missão:
1. `src/modules/habits/HabitsCoordinator.ts` e seus testes unitários em `src/modules/habits/__tests__/`.
2. `src/screens/BodyMovementScreen/` (`BodyMovementView.tsx`, `useBodyMovement.ts`).
3. `src/screens/SelfCareScreen/` (`SelfCareView.tsx`, `useSelfCare.ts`).
4. Execução de testes passando via `cmd /c npm test`.
