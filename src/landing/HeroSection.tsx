import * as React from 'react';
import { useState } from 'react';
import { BrainStage, BrainStageId, UserPerspective } from './types';

const BRAIN_STAGES: readonly BrainStage[] = [
  {
    id: 'baby',
    name: 'Brain Baby',
    title: 'Boas-Vindas & Primeiros Hábitos',
    minChallenges: 1,
    maxChallenges: 5,
    description: 'Os primeiros rituais de mente e corpo sendo consolidados com leveza.',
    avatar: '🌱🧠',
    color: '#10B981',
  },
  {
    id: 'kid',
    name: 'Brain Kid',
    title: 'Descoberta & Curiosidade',
    minChallenges: 6,
    maxChallenges: 20,
    description: 'Rotina de 3 desafios diários ativa e integrada ao dia a dia.',
    avatar: '✨🧠',
    color: '#38BDF8',
  },
  {
    id: 'teen',
    name: 'Brain Teen',
    title: 'Agilidade & Preservação',
    minChallenges: 21,
    maxChallenges: 50,
    description: 'Conexões neurais fortalecidas com ginástica cerebral prazerosa.',
    avatar: '⚡🧠',
    color: '#A855F7',
  },
  {
    id: 'mega',
    name: 'Mega Brain',
    title: 'Maturidade & Longevidade Plena',
    minChallenges: 51,
    maxChallenges: '+',
    description: 'Estágio de ouro: autonomia, afeto, mobilidade e clareza duradoura.',
    avatar: '👑🧠',
    color: '#F59E0B',
  },
];

export interface HeroSectionProps {
  perspective?: UserPerspective;
  onOpenAppShowcase: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  perspective = 'senior',
  onOpenAppShowcase,
}) => {
  const [activeStageId, setActiveStageId] = useState<BrainStageId>('teen');
  const [completedCount, setCompletedCount] = useState<number>(34);
  const [justLeveledUp, setJustLeveledUp] = useState<boolean>(false);

  const currentStage = BRAIN_STAGES.find((s) => s.id === activeStageId) ?? BRAIN_STAGES[2];

  const handleSimulateChallenge = () => {
    setCompletedCount((prev) => {
      const next = prev + 1;
      if (next === 51) {
        setActiveStageId('mega');
        setJustLeveledUp(true);
        setTimeout(() => setJustLeveledUp(false), 2000);
      }
      return next;
    });
  };

  return (
    <section id="hero" className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Subtle organic background gradients (No AI neon) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-950/20 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-sky-950/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Coluna Esquerda: Proposta de Valor & Conversão (7 colunas) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow tag (1 of max 3 na página inteira) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 border border-white/10 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-vital-emerald animate-pulse" />
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
                Longevidade Cognitiva & Gentle Rhythm
              </span>
            </div>

            {/* Headline Display — Máx. 2 linhas em desktop, Geist Sans com tracking refinado */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white leading-[1.1] mb-6">
              Sua mente ativa e serena.{' '}
              <span className="text-zinc-400 font-normal block sm:inline">
                No seu próprio ritmo.
              </span>
            </h1>

            {/* Subtexto conciso (<= 20 palavras), empático e adaptável por perspectiva */}
            <p className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed max-w-[54ch] mb-8">
              {perspective === 'senior'
                ? 'O primeiro ecossistema diário de estimulação cognitiva com 4 pilares de vida, zero culpa e ergonomia sênior WCAG AAA.'
                : 'Proporcione aos seus pais autonomia mental, caminhadas tranquilas e afeto diário, sem pressão ou frustração.'}
            </p>

            {/* CTAs Táteis em Pílula (Button-in-Button Architecture) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <button
                type="button"
                onClick={onOpenAppShowcase}
                className="group flex items-center justify-between sm:justify-center gap-4 px-7 py-4 rounded-full bg-white text-zinc-950 font-semibold text-base sm:text-lg hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(255,255,255,0.2)] min-h-[58px]"
              >
                <span>Começar Gratuitamente</span>
                <span className="w-8 h-8 rounded-full bg-zinc-950/10 flex items-center justify-center transition-transform group-hover:translate-x-1 font-bold">
                  →
                </span>
              </button>

              <a
                href="#pilares"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-surface-elevated border border-white/10 text-zinc-200 font-medium text-base hover:border-white/20 hover:text-white active:scale-[0.98] transition-all min-h-[58px]"
              >
                <span>Conhecer os 4 Pilares</span>
              </a>
            </div>

            {/* Selos de Confiança Sênior (Tranquilidade e Privacidade) */}
            <div className="pt-6 border-t border-white/10 w-full flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="text-vital-emerald">✓</span>
                <span>Neurociência Sem Culpa</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-vital-cyan">✓</span>
                <span>100% Offline-First</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-vital-amber">✓</span>
                <span>WCAG AAA (Fonte ≥ 18px)</span>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Preview Tátil Interativo do Cérebro Virtual (5 colunas) */}
          <div className="lg:col-span-5">
            {/* Double-Bezel Shell */}
            <div className="p-2 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              {/* Inner Core */}
              <div className="bg-surface-base rounded-[2rem] p-7 border border-white/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] relative overflow-hidden">
                
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-vital-purple animate-pulse" />
                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold">
                      Cérebro Virtual Permanente
                    </span>
                  </div>
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-white/5">
                    ADR-0003 Anti-Culpa
                  </span>
                </div>

                {/* Avatar Visual com Respiração Suave */}
                <div className="flex flex-col items-center text-center my-4">
                  <div className="relative mb-4">
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center text-5xl bg-surface-elevated border-2 transition-all duration-500 shadow-lg"
                      style={{ borderColor: currentStage.color }}
                    >
                      <span className="transform transition-transform hover:scale-110 select-none">
                        {currentStage.avatar}
                      </span>
                    </div>
                    {justLeveledUp && (
                      <span className="absolute -top-2 -right-2 bg-vital-amber text-amber-950 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md transition-all duration-300 ease-out animate-pulse">
                        EVOLUIU!
                      </span>
                    )}
                  </div>

                  <h2 className="font-sans text-xl font-bold text-white mb-1">
                    {currentStage.name}
                  </h2>
                  <p className="font-mono text-xs text-zinc-400 mb-3">
                    {currentStage.title}
                  </p>
                  <p className="text-sm text-zinc-300 max-w-[34ch] leading-relaxed mb-6">
                    {currentStage.description}
                  </p>

                  {/* Contador Cumulativo em Geist Mono */}
                  <div className="w-full bg-surface-elevated/90 border border-white/10 rounded-2xl p-4 mb-5">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-xs text-zinc-400 font-sans">
                        Desafios Acumulados:
                      </span>
                      <span className="font-mono text-2xl font-bold text-white">
                        {completedCount}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (completedCount / 60) * 100)}%`,
                          backgroundColor: currentStage.color,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 text-left mt-2 italic font-sans">
                      🌱 Regra de Ouro: Este progresso nunca regride, mesmo em dias inativos.
                    </p>
                  </div>

                  {/* Botão Interativo de Simulação */}
                  <button
                    type="button"
                    onClick={handleSimulateChallenge}
                    className="w-full py-3 px-4 rounded-full bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-xs font-semibold text-zinc-100 border border-white/10 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Completar Desafio Lúdico</span>
                    <span className="font-mono text-vital-emerald">+1</span>
                  </button>

                  {/* Seletor Rápido de Estágios para Demonstração */}
                  <div className="flex items-center justify-center gap-1.5 mt-4 w-full pt-4 border-t border-white/5">
                    {BRAIN_STAGES.map((stg) => (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => setActiveStageId(stg.id)}
                        className={`text-[10px] font-mono px-2 py-1 rounded-md transition-all ${
                          activeStageId === stg.id
                            ? 'bg-zinc-700 text-white font-bold border border-white/20'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {stg.name.replace('Brain ', '')}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
