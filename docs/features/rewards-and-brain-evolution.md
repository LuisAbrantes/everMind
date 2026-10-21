# Feature Spec: Sistema de Recompensas, Conquistas & Evolução do Cérebro Virtual

> **Identificador:** `rewards-and-brain-evolution`  
> **Área:** Motor de Gamificação Acolhedora, Retenção Positiva & Economia de Recompensas  
> **Objetivo:** Estabelecer a mecânica formal de crescimento do Cérebro Virtual, concessão de badges e resiliência psicológica anti-culpa (*Gentle Fallback*).

---

## 🧠 1. Os 4 Estágios do Cérebro Virtual

O Cérebro Virtual evolui à medida que o usuário acumula desafios concluídos em qualquer um dos 4 pilares:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     🧠🌱        │       │     🧠✨        │       │     🧠⚡        │       │     🧠👑        │
│   Brain Baby    │ ────▶ │    Brain Kid    │ ────▶ │   Brain Teen    │ ────▶ │   Mega Brain    │
│  (1 a 5 feitos) │       │ (6 a 20 feitos) │       │ (21 a 50 feitos)│       │  (51+ feitos)   │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Regras da Máquina de Estados:
1. **Monotonicidade Estrita (Não-Involução):** O Cérebro Virtual nunca perde níveis ou "morre" por falta de uso. Uma vez alcançado o estágio *Brain Kid*, o usuário é permanentemente *Brain Kid* até avançar para *Brain Teen*.
2. **Nutrientes Diários:** Cada desafio concluído confere $+10$ pontos de energia cognitiva ao jardim digital.
3. **Animação de Celebração de Nível:** A transição de estágio dispara uma vinheta festiva de 3 segundos com confetes coloridos e som de triunfo orquestrado suave.

---

## 🔥 2. Motor de Streaks Acolhedores (Gentle Fallback)

O cálculo de sequência valoriza a consistência sem criar medo ou punição:

| Situação | Ação do Motor | Mensagem Exibida ao Usuário |
| :--- | :--- | :--- |
| **Acesso Consecutivo (Dia + 1)** | Incrementa $Streak + 1$ | *"🔥 Que alegria! Você está há $N$ dias cuidando dos seus hábitos!"* |
| **Múltiplos Acessos no Mesmo Dia** | Mantém $Streak$ atual | *"🔥 Você está firme hoje! Continue aproveitando o seu dia."* |
| **Dias Sem Acesso (Gap $\ge 2$ dias)** | Ajusta $Streak = 1$, **mantém total acumulado** | *"🌱 Tudo bem! Cada dia tem seu próprio ritmo. Hoje é uma nova oportunidade para cuidar de você."* |

---

## 🏆 3. Catálogo Oficial de Conquistas (Badges)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🥉 PRIMEIROS PASSOS                                                         │
│    Gatilho: Concluir os primeiros 5 desafios globais.                       │
│    Mensagem: "Você começou uma linda jornada de bem-estar!"                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🥈 SEMANA ATIVA                                                             │
│    Gatilho: Atividade em pelo menos 5 dos últimos 7 dias (ADR-0009).                 │
│    Mensagem: "Sua constância ao longo da semana é inspiradora!"             │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🥇 MENTE EM MOVIMENTO                                                       │
│    Gatilho: Concluir 30 atividades cognitivas no Pilar Mente.               │
│    Mensagem: "Seu cérebro está mais ágil, flexível e brilhante!"            │
├─────────────────────────────────────────────────────────────────────────────┤
│ ❤️ AMIGO PRESENTE                                                           │
│    Gatilho: Concluir 10 desafios de socialização no Pilar Conexão.          │
│    Mensagem: "Você espalha carinho e mantém seus laços sempre vivos!"       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 🚶 CAMINHANTE                                                               │
│    Gatilho: Concluir 20 sessões de caminhada no Pilar Movimento.            │
│    Mensagem: "Seus passos conquistam saúde e vitalidade todos os dias!"     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 4. Estruturas TypeScript do Motor de Recompensas

```typescript
export interface IBadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  pillarReward: 'MIND' | 'MOVEMENT' | 'SELFCARE' | 'CONNECTION' | 'GLOBAL';
  unlockedAt: string | null;
}

export interface IRewardSystemState {
  totalCompletedChallenges: number;
  currentBrainStage: 'BABY' | 'KID' | 'TEEN' | 'MEGA';
  currentStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  badges: IBadgeDefinition[];
  growthPoints: number;
}
```

---

## 🧪 5. Critérios de Teste e Aceitação

- [ ] A máquina de estados de evolução do cérebro é 100% pura e coberta por testes comJest/Vitest.
- [ ] O algoritmo de *Gentle Fallback* é testado com diferentes saltos temporais garantindo zero mensagens punitivas.
- [ ] O desbloqueio de badges ocorre de forma atômica e emite eventos de celebração na UI.
