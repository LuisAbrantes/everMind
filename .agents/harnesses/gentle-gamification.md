# Harness: Gamificação Acolhedora & Streaks Sem Culpa

> **Objetivo:** Estabelecer o protocolo de implementação e validação do motor de recompensas, evolução do Cérebro Virtual e lógica de *Gentle Fallback* do everMind.

---

## 🧭 Passo 1: Contexto e Persona

1. Ler `docs/features/rewards-and-brain-evolution.md` e `docs/DECISIONS.md` (ADR-0003).
2. Adotar a persona [`.agents/gamification-rewards-engineer.md`](../gamification-rewards-engineer.md).

---

## 🧠 Passo 2: Especificação da Máquina de Estados

### 1. Evolução do Cérebro Virtual (`BrainState`)
A progressão é uma função pura e estritamente monótona crescente:

```typescript
export type BrainStage = 'BABY' | 'KID' | 'TEEN' | 'MEGA';

export function calculateBrainStage(totalCompletedChallenges: number): BrainStage {
  if (totalCompletedChallenges >= 51) return 'MEGA';
  if (totalCompletedChallenges >= 21) return 'TEEN';
  if (totalCompletedChallenges >= 6) return 'KID';
  return 'BABY';
}
```

*Regra Inegociável:* O estágio do usuário nunca pode ser reduzido, mesmo se houver exclusão de logs temporários ou períodos sem uso.

### 2. Algoritmo de Gentle Fallback para Streaks
```typescript
export interface IStreakResult {
  currentStreak: number;
  totalActiveDays: number;
  encouragementMessage: string;
  isNewDay: boolean;
}

export function evaluateDailyStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  totalActiveDays: number,
  today: Date = new Date()
): IStreakResult {
  if (!lastActiveDate) {
    return {
      currentStreak: 1,
      totalActiveDays: 1,
      encouragementMessage: "🌟 Bem-vindo! Hoje é um ótimo dia para começar a cuidar de você!",
      isNewDay: true,
    };
  }

  const diffDays = getCalendarDayDifference(new Date(lastActiveDate), today);

  if (diffDays === 0) {
    return {
      currentStreak,
      totalActiveDays,
      encouragementMessage: `🔥 Você está firme hoje! Continue aproveitando o seu dia.`,
      isNewDay: false,
    };
  }

  if (diffDays === 1) {
    const nextStreak = currentStreak + 1;
    return {
      currentStreak: nextStreak,
      totalActiveDays: totalActiveDays + 1,
      encouragementMessage: `🔥 Que alegria! Você está há ${nextStreak} dias cuidando dos seus hábitos!`,
      isNewDay: true,
    };
  }

  // Fallback Gentil (Dias inativos)
  return {
    currentStreak: 1,
    totalActiveDays: totalActiveDays + 1,
    encouragementMessage: "🌱 Tudo bem! Cada dia tem seu próprio ritmo. Hoje é uma nova oportunidade para cuidar de você.",
    isNewDay: true,
  };
}
```

---

## 🏆 Passo 3: Avaliação de Badges de Conquista

As 5 badges canônicas devem ser avaliadas a cada ação concluída:
1. `BADGE_FIRST_STEPS`: `totalCompletedChallenges >= 5`
2. `BADGE_ACTIVE_WEEK`: `consecutiveActiveDays >= 7` ou `weeklyCompletedChallenges >= 7`
3. `BADGE_MIND_IN_MOTION`: `mindPillarCompletedCount >= 30`
4. `BADGE_PRESENT_FRIEND`: `socialPillarCompletedCount >= 10`
5. `BADGE_WALKER`: `movementPillarCompletedCount >= 20`

---

## 📋 Passo 4: Critérios de Aceite

- [ ] Zero ocorrências de termos culposos (*"perdeu streak"*, *"zerou"*).
- [ ] Testes unitários com simulação de saltos no tempo (1 dia, 3 dias, 30 dias) validando as mensagens acolhedoras.
- [ ] Persistência atômica e segura no storage local.
