# Feature Spec: Tela 04 — Cuide de Você (Autocuidado, Água, Nutrição & Sono)

> **Identificador:** `screen-04-selfcare`  
> **Pilar Central:** Autocuidado (*Nutrição Consciente, Hidratação & Higiene do Sono*)  
> **Objetivo Cognitivo-Comportamental:** Consolidar três hábitos vitais de manutenção física e mental com confirmações simples de um único toque e reforço positivo imediato.

---

## 🌿 1. Anatomia Visual e Componentes da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ 🌿 Cuide de Você                             [ 🏠 Início ]  │
│ Pequenos gestos de amor pelo seu corpo e pela sua mente:    │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💧 1. HORA DA ÁGUA                                      │ │
│ │ "A hidratação mantém suas células e cérebro ativos!"    │ │
│ │ Copos registrados hoje: 🥤 🥤 🥤 [ + Adicionar Copo ]   │ │
│ │                  [ ✅ JÁ BEBI ÁGUA HOJE ]               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🍎 2. MISSÃO PRATO COLORIDO                             │ │
│ │ "Você incluiu uma fruta ou verdura nas suas refeições?" │ │
│ │                  [ ✅ SIM, COMI HOJE! ]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌙 3. BOA NOITE (HIGIENE DO SONO)                       │ │
│ │ "Um sono tranquilo restaura suas memórias."            │ │
│ │ Dica: Evite telas 30 minutos antes de se deitar.        │ │
│ │                  [ ✅ VOU ME PREPARAR ]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 💬 "Cuidar de você é o melhor investimento do seu dia!"    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Modelo de Dados e Estados

```typescript
export interface ISelfCareDailyState {
  date: string;
  waterGlassesCount: number; // Mínimo meta sugerida: 4 copos
  isWaterGoalMet: boolean;
  hasEatenFruitOrVeggie: boolean;
  isSleepRoutineConfirmed: boolean;
  totalSelfCareActionsCount: number;
}
```

---

## 🔄 3. Fluxo de Interação e Feedback

1. **Hora da Água:**
   - O usuário pode tocar em `[ + Adicionar Copo ]` para cada copo consumido ou tocar diretamente em `[ ✅ JÁ BEBI ÁGUA HOJE ]`.
   - Feedback: Gotas d'água animadas, som de água cristalina e mensagem carinhosa: *"💧 Seu corpo agradece o cuidado!"*.
2. **Missão Fruta / Vegetal:**
   - Toque afirmativo em `[ ✅ SIM, COMI HOJE! ]`.
   - Feedback: Animação de maçã/cenoura com brilho dourado e parabenização pelo prato colorido e saudável.
3. **Boa Noite (Sono Restaurador):**
   - Exibição de dica relaxante (respiração suave, luz baixa, chá calmante).
   - O usuário confirma seu ritual noturno em `[ ✅ VOU ME PREPARAR ]`.

---

## ♿ 4. Acessibilidade Sênior (WCAG AAA)

- **Cards com Alto Contraste:** Bordas destacadas em verde esmeralda (`#10B981`) e azul ciano (`#38BDF8`) facilitam a diferenciação de cada bloco.
- **Botões Grandes de Toque Único:** Altura de `54dp` com rótulos afirmativos em primeira pessoa (*"Já bebi", "Comi hoje"*).
- **Leitores de Tela:** Cada seção lê o título do hábito, a explicação breve e o estado atual de marcação.

---

## 🧪 5. Critérios de Aceitação

- [ ] Os estados de cada um dos 3 hábitos são persistidos independentemente no storage local.
- [ ] Concluir qualquer um dos três hábitos soma pontos ao Pilar Autocuidado na Retrospectiva Semanal (Tela 7).
- [ ] O contador de água permite incremento fácil sem limites estressantes.
