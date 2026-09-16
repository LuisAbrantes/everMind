import * as React from 'react';
import { UserPerspective } from './types';

export interface ConversionCtaSectionProps {
  perspective?: UserPerspective;
  onOpenAppShowcase: () => void;
}

export const ConversionCtaSection: React.FC<ConversionCtaSectionProps> = ({
  perspective = 'senior',
  onOpenAppShowcase,
}) => {
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden">
      {/* Background Soft Glow (Zero Neon AI Slop) */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-emerald-950/20 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Double-Bezel Container para a Seção de Conversão */}
        <div className="p-2 rounded-[2.75rem] bg-white/[0.04] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)]">
          <div className="bg-surface-base rounded-[2.25rem] p-10 sm:p-16 border border-white/[0.08] relative overflow-hidden">
            
            {/* 3º Eyebrow da página (total 3 no site completo — estritamente em conformidade) */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 border border-white/10 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-vital-emerald" />
              <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
                Comece Hoje no Seu Ritmo
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-sans font-bold tracking-tight text-white mb-6 leading-tight max-w-[20ch] mx-auto">
              Dê à sua mente o carinho e o ritmo que ela merece.
            </h2>

            <p className="text-lg sm:text-xl text-zinc-300 max-w-[50ch] mx-auto mb-10 leading-relaxed">
              {perspective === 'senior'
                ? 'Sem pressa, sem cronômetros de estresse e sem medo de esquecer um dia. Três hábitos prazerosos para viver com plenitude.'
                : 'Instale no celular dos seus pais em 2 minutos. Uma rotina afetuosa e digna que preserva a lucidez e aproxima sua família.'}
            </p>

            {/* CTA Master em Pílula (Button-in-Button Architecture) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <button
                type="button"
                onClick={onOpenAppShowcase}
                className="group flex items-center justify-center gap-4 px-8 py-5 rounded-full bg-white text-zinc-950 font-bold text-lg hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-[0_4px_30px_rgba(255,255,255,0.25)] min-h-[64px] w-full sm:w-auto"
              >
                <span>Acessar o everMind Gratuitamente</span>
                <span className="w-9 h-9 rounded-full bg-zinc-950/10 flex items-center justify-center transition-transform group-hover:translate-x-1 font-bold text-base">
                  →
                </span>
              </button>
            </div>

            {/* Micro-Garantias de Baixa Fricção */}
            <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-400 font-mono">
              <span>✓ Sem Anúncios Invasivos</span>
              <span>•</span>
              <span>✓ Sem Cartão de Crédito</span>
              <span>•</span>
              <span>✓ 100% Offline e Privado</span>
              <span>•</span>
              <span>✓ Fonte Sênior Ajustável</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
