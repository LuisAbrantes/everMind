import * as React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="py-16 border-t border-white/10 bg-[#09090B] text-zinc-400 text-sm">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand & Manifesto */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <span className="font-sans font-bold text-lg text-white">
              ever<span className="text-vital-emerald">Mind</span>
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-sans max-w-[40ch]">
            Estimulação cognitiva, bem-estar e longevidade ativa para o público 60+ com
            gamificação acolhedora e zero culpa.
          </p>
        </div>

        {/* Links de Governança & Arquitetura */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-zinc-400">
          <a
            href="#pilares"
            className="hover:text-white transition-colors"
          >
            Os 4 Pilares
          </a>
          <a
            href="#anti-culpa"
            className="hover:text-white transition-colors"
          >
            ADR-0003 Anti-Culpa
          </a>
          <a
            href="#ergonomia"
            className="hover:text-white transition-colors"
          >
            ADR-0005 WCAG AAA
          </a>
          <a
            href="#hero"
            className="hover:text-white transition-colors"
          >
            ADR-0007 Nordic Zen
          </a>
        </div>

        {/* Copyright & Dignity */}
        <div className="text-xs text-zinc-600 font-mono text-center md:text-right">
          <p>© 2026 everMind · Todos os direitos reservados.</p>
          <p className="mt-1 text-zinc-500 font-sans">
            Desenhado com carinho, neurociência e respeito ao tempo humano.
          </p>
        </div>

      </div>
    </footer>
  );
};
