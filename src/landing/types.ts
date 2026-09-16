/**
 * Tipos Canônicos para a Landing Page do everMind
 * Alinhado a CONTEXT.md, DESIGN.md (Variante C Nordic Zen) e Matt Pocock (Total TypeScript)
 */

export type PillarId = 'mind' | 'movement' | 'selfcare' | 'connection';

export interface PillarFeature {
  readonly id: PillarId;
  readonly name: string;
  readonly subtitle: string;
  readonly description: string;
  readonly badge: string;
  readonly hexColor: string;
  readonly bgSoft: string;
  readonly icon: string;
  readonly highlights: readonly string[];
  readonly colSpanDesktop: 'col-span-8' | 'col-span-4';
}

export type BrainStageId = 'baby' | 'kid' | 'teen' | 'mega';

export interface BrainStage {
  readonly id: BrainStageId;
  readonly name: string;
  readonly title: string;
  readonly minChallenges: number;
  readonly maxChallenges: number | '+';
  readonly description: string;
  readonly avatar: string;
  readonly color: string;
}

export interface Testimonial {
  readonly id: string;
  readonly author: string;
  readonly role: string;
  readonly age?: number;
  readonly avatarText: string;
  readonly quote: string;
  readonly highlightPillar: PillarId;
}

export interface ErgonomicFeature {
  readonly id: string;
  readonly title: string;
  readonly spec: string;
  readonly description: string;
  readonly icon: string;
  readonly contrastNote: string;
}

export type UserPerspective = 'senior' | 'family';
export type SeniorTextScale = 'normal' | 'large' | 'extra';
