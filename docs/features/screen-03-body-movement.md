# Feature Spec: Tela 03 — Mexa o Corpo (Caminhada de 10 Minutos)

> **Identificador:** `screen-03-body-movement`  
> **Pilar Central:** Movimento (*Saúde Física, Mobilidade & Disposição*)  
> **Objetivo Cognitivo-Motor:** Incentivar a locomoção física regular através de uma meta simples, agradável e desprovida de exigências atléticas pesadas.

---

## 🚶 1. Anatomia Visual e Componentes da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ 🚶 Mexa o Corpo                              [ 🏠 Início ]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌟 DESAFIO DO DIA: "Dê uma Volta!"                      │ │
│ │                                                         │ │
│ │ Uma caminhada leve de 10 minutos faz maravilhas pelo    │ │
│ │ seu corpo e oxigena sua mente.                          │ │
│ │                                                         │ │
│ │ 📍 Onde caminhar?                                       │ │
│ │  • Na sua rua ou praça perto de casa                    │ │
│ │  • No seu quintal ou jardim                             │ │
│ │  • Ou dando passos confortáveis dentro de casa!         │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    ⏱️ TEMPO SUGERIDO                        │
│                         10:00                               │
│                                                             │
│       [ ▶️ INICIAR CONTAGEM ]    [ ⏸️ PAUSAR ]              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │            [ ✅ MARCAR COMO CONCLUÍDO ]                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ 💬 "Caminhar no seu próprio ritmo é o melhor exercício!"   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Modelo de Dados e Estados de Uso

```typescript
export interface IBodyMovementState {
  targetMinutes: number; // Padrão: 10
  elapsedSeconds: number;
  timerStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  isCompletedToday: boolean;
  totalMovementSessions: number;
}
```

---

## 🔄 3. Fluxo de Interação

1. **Acesso à Tela:**
   - O usuário lê a sugestão de locais acessíveis (rua, quintal ou sala).
2. **Uso do Timer Opcional:**
   - O usuário pode tocar em `[ ▶️ INICIAR CONTAGEM ]` para acompanhar o tempo enquanto caminha.
   - O timer emite um sino suave aos 5 minutos (metade) e aos 10 minutos (conclusão).
3. **Conclusão Direta (Zero Burocracia):**
   - Caso o usuário já tenha caminhado antes de abrir o aplicativo, ele pode tocar diretamente no botão principal **`[ ✅ MARCAR COMO CONCLUÍDO ]`** a qualquer momento.
4. **Celebração:**
   - A tela dispara uma animação com confetes verdes, vibração sutil e a mensagem:
     *"🌿 Parabéns! Suas pernas e seu coração agradecem! Você completou sua caminhada de hoje."*
   - O evento soma 1 ponto ao Pilar Movimento e avalia o progresso para a badge *Caminhante* (20 caminhadas).

---

## ♿ 4. Diretrizes de Acessibilidade Sênior (WCAG AAA)

- **Área de Toque do Botão Principal:** Altura de `64dp` com cantos arredondados e cor verde esmeralda vibrante de alto contraste (`#10B981` sobre fundo escuro).
- **Tipografia:** Texto de orientação com `20sp` e contraste $\ge 9:1$.
- **Leitor de Tela:** O botão `[ ✅ MARCAR COMO CONCLUÍDO ]` possui rótulo claro: *"Marcar caminhada de 10 minutos como concluída hoje"*.

---

## 🧪 5. Critérios de Aceitação

- [ ] O timer roda em segundo plano sem travar caso a tela seja temporariamente minimizada.
- [ ] O usuário pode marcar como concluído sem ser obrigado a usar o timer.
- [ ] A conclusão persiste localmente no MMKV e atualiza a Tríade do Dia na Tela Inicial.
