import * as React from 'react';

export interface LandingHeaderProps {
  onCtaClick: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onCtaClick,
}) => {
  return (
    <header className="fixed top-4 inset-x-0 z-50 px-4 mx-auto max-w-6xl pointer-events-none">
      <div className="flex items-center justify-between pointer-events-auto bg-[#121215]/90 backdrop-blur-xl border border-white/10 rounded-full px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-surface-elevated border border-white/10 flex items-center justify-center text-xl transition-transform group-hover:scale-105">
            🧠
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-lg tracking-tight text-white leading-none">
              ever<span className="text-vital-emerald">Mind</span>
            </span>
            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest leading-tight">
              Nordic Zen 60+
            </span>
          </div>
        </a>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300 font-medium">
          <a href="#pilares" className="hover:text-white transition-colors">
            Os 4 Pilares
          </a>
          <a href="#anti-culpa" className="hover:text-white transition-colors">
            Filosofia Sem Culpa
          </a>
          <a href="#ergonomia" className="hover:text-white transition-colors">
            Acessibilidade AAA
          </a>
          <a href="#depoimentos" className="hover:text-white transition-colors">
            Depoimentos
          </a>
        </nav>

        {/* Primary Action Button (Nested Pill) */}
        <button
          type="button"
          onClick={onCtaClick}
          className="group flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
        >
          <span>Experimentar</span>
          <span className="w-7 h-7 rounded-full bg-zinc-950/10 flex items-center justify-center transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>
    </header>
  );
};
