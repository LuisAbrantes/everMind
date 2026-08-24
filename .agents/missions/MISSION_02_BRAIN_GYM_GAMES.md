# Missão 02: Tela 2 — Ginástica Cerebral & Motores dos 5 Mini-Jogos

**Status:** ⏳ PENDENTE / PRONTO PARA EXECUÇÃO

## Contexto & Regras Obrigatórias
- **Skills a Usar:** `codebase-design`, `tdd`, `mobile-ui-ux-design`, `mobile-android-design`.
- **Acessibilidade Sênior (WCAG AAA):** Sem temporizadores punitivos (pressão zero de tempo), alvos de toque >= 54dp, feedback sonoro e háptico suave.
- **Design:** Black & White shadcn + Geist Sans/Mono.

## Escopo dos 5 Mini-Jogos (Deep Modules em `src/modules/brain/`):
1. **Memória Visual (`MemoryGameEngine.ts`):** 5 imagens/ícones para memorizar e reencontrar em uma grade.
2. **Sequência Numérica (`SequenceGameEngine.ts`):** Raciocínio lógico (ex: 2 ➔ 4 ➔ 6 ➔ [ ? ]).
3. **Jogo de Palavras (`WordsGameEngine.ts`):** Formação/descoberta de palavras com uma letra específica.
4. **Atenção Visual / Diferenças (`AttentionGameEngine.ts`):** Encontrar o item dissonante na grade.
5. **Reconhecimento Musical (`MusicGameEngine.ts`):** Identificar canções e melodias afetivas.

## Entregáveis da Missão:
1. `src/modules/brain/` com os 5 engines puros e desacoplados de UI.
2. Suíte de testes unitários TDD em `src/modules/brain/__tests__/` com 100% de cobertura dos casos lógicos.
3. `src/screens/BrainGymScreen/` com:
   - `BrainGymScreenView.tsx` (Menu e container dos jogos)
   - Componentes visuais para cada jogo (`MemoryView.tsx`, `SequenceView.tsx`, `WordsView.tsx`, `AttentionView.tsx`, `MusicView.tsx`)
   - `useBrainGym.ts` (Hook integrando com Gamificação e Cérebro Virtual).
4. Execução de testes passando via `cmd /c npm test`.
