import { IStreakEvaluation } from '../domain/types';

/**
 * Gentle Streak Manager (Anti-Guilt Policy)
 * ADR-0003 & gentle-gamification.md
 * 
 * Rules:
 * - Consecutive access (day + 1): Streak + 1
 * - Same day access: Maintains current streak
 * - Missing 1 or more days: Resets streak to 1 without punitive words, encouraging present action.
 * - Prohibited words: "perdeu", "falhou", "zerou", "atrasado", "punição", "perda".
 */
export class GentleStreakManager {
  public static readonly PROHIBITED_WORDS = [
    'perdeu',
    'falhou',
    'zerou',
    'atrasado',
    'atrasada',
    'punicao',
    'punição',
    'perda',
    'falta',
  ];

  public static getCalendarDayDifference(fromDate: Date, toDate: Date): number {
    const d1 = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
    const d2 = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
  }

  public static evaluateDailyStreak(
    lastActiveDate: string | null,
    currentStreak: number,
    totalActiveDays: number,
    today: Date = new Date()
  ): IStreakEvaluation {
    if (!lastActiveDate) {
      return {
        currentStreak: 1,
        totalActiveDays: 1,
        encouragementMessage: '🌱 Bem-vindo! Hoje é um ótimo dia para começar a cuidar de você no seu próprio ritmo.',
        isNewDay: true,
      };
    }

    const lastDate = new Date(lastActiveDate);
    const diffDays = this.getCalendarDayDifference(lastDate, today);

    if (diffDays <= 0) {
      // Same calendar day
      return {
        currentStreak: Math.max(1, currentStreak),
        totalActiveDays: Math.max(1, totalActiveDays),
        encouragementMessage: '🔥 Você está firme hoje! Continue aproveitando o seu dia.',
        isNewDay: false,
      };
    }

    if (diffDays === 1) {
      // Exactly next consecutive day
      const nextStreak = currentStreak + 1;
      return {
        currentStreak: nextStreak,
        totalActiveDays: totalActiveDays + 1,
        encouragementMessage: `🔥 Que alegria! Você está há ${nextStreak} dias cultivando seus hábitos com carinho!`,
        isNewDay: true,
      };
    }

    // Gap >= 2 days: Gentle Fallback (Anti-Guilt)
    return {
      currentStreak: 1,
      totalActiveDays: totalActiveDays + 1,
      encouragementMessage: '🌱 Tudo bem! Cada dia tem seu próprio ritmo. Hoje é uma nova oportunidade para cuidar de você.',
      isNewDay: true,
    };
  }

  public static sanitizeMessage(text: string): string {
    let cleanText = text;
    for (const word of this.PROHIBITED_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(cleanText)) {
        cleanText = cleanText.replace(regex, 'recomeço gentil');
      }
    }
    return cleanText;
  }
}
