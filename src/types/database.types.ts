/**
 * Database Types for everMind (Supabase & PostgreSQL)
 * Automatically aligned with migration: 20260819120000_create_evermind_schema.sql
 *
 * References:
 * - CONTEXT.md (4 Pilares: Mente, Movimento, Autocuidado, Conexão)
 * - ADR-0002 (Offline-First)
 * - ADR-0003 (Gentle Fallback)
 * - ADR-0008 (Supabase Backend)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * 4 Pilares da Longevidade Saudável
 */
export type ChallengePillarType = 'mind' | 'movement' | 'selfcare' | 'connection';

/**
 * Estágios de Evolução do Cérebro Virtual (Monotônicos / Não-Involutivos)
 */
export type BrainStageType = 'baby' | 'kid' | 'teen' | 'mega_brain';

/**
 * Catálogo Canônico de Conquistas / Emblemas de Honra
 */
export type BadgeKeyType =
  | 'first_steps'
  | 'active_week'
  | 'moving_mind'
  | 'present_friend'
  | 'walker';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_triads: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          challenge_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          challenge_ids?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          challenge_ids?: string[];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_triads_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      challenge_completions: {
        Row: {
          id: string;
          user_id: string;
          challenge_type: ChallengePillarType;
          challenge_id: string | null;
          completed_at: string;
          date: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_type: ChallengePillarType;
          challenge_id?: string | null;
          completed_at?: string;
          date?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_type?: ChallengePillarType;
          challenge_id?: string | null;
          completed_at?: string;
          date?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'challenge_completions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      virtual_brain_state: {
        Row: {
          id: string;
          user_id: string;
          current_stage: BrainStageType;
          total_points: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_stage?: BrainStageType;
          total_points?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_stage?: BrainStageType;
          total_points?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'virtual_brain_state_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_key: BadgeKeyType;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_key: BadgeKeyType;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_key?: BadgeKeyType;
          unlocked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_achievements_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      challenge_pillar_type: ChallengePillarType;
      brain_stage_type: BrainStageType;
      badge_key_type: BadgeKeyType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// ----------------------------------------------------------------------------
// Helper Types for Clean Repository & Gateway Integrations
// ----------------------------------------------------------------------------

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Row Types
export type ProfileRow = Tables<'profiles'>;
export type DailyTriadRow = Tables<'daily_triads'>;
export type ChallengeCompletionRow = Tables<'challenge_completions'>;
export type VirtualBrainStateRow = Tables<'virtual_brain_state'>;
export type UserAchievementRow = Tables<'user_achievements'>;

// Insert Types
export type ProfileInsert = TablesInsert<'profiles'>;
export type DailyTriadInsert = TablesInsert<'daily_triads'>;
export type ChallengeCompletionInsert = TablesInsert<'challenge_completions'>;
export type VirtualBrainStateInsert = TablesInsert<'virtual_brain_state'>;
export type UserAchievementInsert = TablesInsert<'user_achievements'>;

// Update Types
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type DailyTriadUpdate = TablesUpdate<'daily_triads'>;
export type ChallengeCompletionUpdate = TablesUpdate<'challenge_completions'>;
export type VirtualBrainStateUpdate = TablesUpdate<'virtual_brain_state'>;
export type UserAchievementUpdate = TablesUpdate<'user_achievements'>;
