# Harness: Implementação de Mini-Jogos Cognitivos (Tela 2)

> **Objetivo:** Orientar o desenvolvimento rigoroso, testável e sem estresse dos mini-jogos da Ginástica Cerebral do everMind.

---

## 🧭 Passo 1: Contexto e Persona

1. Ler `docs/features/screen-02-brain-gym.md` e `docs/DECISIONS.md`.
2. Adotar a persona [`.agents/cognitive-games-engineer.md`](../cognitive-games-engineer.md).
3. Selecionar a modalidade a ser implementada:
   - *Memória Visual (5 Imagens)*
   - *Sequência Lógica ($2 \rightarrow 4 \rightarrow 6 \rightarrow ?$)*
   - *Formação de Palavras (Letra X)*
   - *Atenção Visual / Diferenças*
   - *Reconhecimento Musical*

---

## 🧩 Passo 2: Estrutura da Engine do Mini-Jogo (TypeScript Puro)

A lógica do jogo deve residir em uma classe/função pura sob `src/modules/brain-gym/games/<NomeDoJogo>/`:

```
src/modules/brain-gym/games/<NomeDoJogo>/
├── <NomeDoJogo>Engine.ts       # Máquina de estados pura do jogo (zero dependências de UI)
├── types.ts                   # Estados, ações e tipos do jogo
├── <NomeDoJogo>Screen.tsx     # Interface visual acessível
└── __tests__/
    └── <NomeDoJogo>Engine.test.ts  # Testes de unidade cobrindo todas as transições
```

### Exemplo de Interface da Engine:
```typescript
export interface ICognitiveGameEngine<TState, TMove, TResult> {
  initializeGame(level?: number): TState;
  submitMove(currentState: TState, move: TMove): TState;
  evaluateResult(currentState: TState): TResult;
  getHint(currentState: TState): string;
}
```

---

## 🛡️ Passo 3: Regras de Execução e Neuropsicologia

1. **Ausência de Temporizador Regressivo:**
   - O jogo não deve possuir relógio de contagem regressiva que resulte em derrota. O usuário joga com calma.
2. **Tratamento de Tentativas Incorretas:**
   - Não disparar alertas vermelhos agressivos.
   - Fornecer retorno suave: *"Tente novamente!"* com dicas contextuais.
3. **Disparo de Evento de Conclusão:**
   - Ao concluir a rodada com sucesso, disparar o evento de domínio:
     ```typescript
     eventDispatcher.dispatch({
       type: 'CHALLENGE_COMPLETED',
       pillar: 'MIND',
       gameId: 'SEQUENCE_2_4_6',
       points: 10,
       completedAt: new Date().toISOString(),
     });
     ```

---

## 📋 Passo 4: Critérios de Aceite

- [ ] A engine do jogo possui 100% de cobertura de testes unitários em TypeScript.
- [ ] A tela do jogo apresenta instruções claras em no máximo 2 linhas com fonte $\ge 18\text{sp}$.
- [ ] O feedback de vitória toca um som agradável e emite vibração háptica suave.
- [ ] O progresso é somado ao Cérebro Virtual imediatamente.
