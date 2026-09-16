import * as React from 'react';
import { useState } from 'react';

export const ZeroGuiltComparison: React.FC = () => {
  const [isMissedDaySimulated, setIsMissedDaySimulated] = useState<boolean>(true);

  return (
    <section id="anti-culpa" className="py-24 lg:py-32 relative bg-zinc-950/60 border-y border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header da Seção com 2º Eyebrow (respeitando a regra de max 1 eyebrow por 3 seções) */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 border border-white/10 mb-4">
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-zinc-300">
              ADR-0003 · Psicologia Anti-Culpa
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white mb-4">
            Por que eliminamos o medo de perder dias?
          </h2>
          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed">
            Aplicativos comuns usam ansiedade e vergonha para forçar uso diário. No everMind,
            acreditamos que o bem-estar sênior nasce da acolhida, da constância afetuosa
            e do respeito ao ritmo de cada pessoa.
          </p>
        </div>

        {/* Simulador Interativo de Dia Inativo */}
        <div className="mb-8 flex items-center justify-center">
          <div className="bg-surface-elevated border border-white/10 rounded-full p-1.5 flex items-center gap-2 text-xs font-mono shadow-md">
            <span className="text-zinc-400 pl-3">Simulação:</span>
            <button
              type="button"
              onClick={() => setIsMissedDaySimulated(false)}
              className={`px-4 py-2 rounded-full transition-all ${
                !isMissedDaySimulated
                  ? 'bg-zinc-100 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Dia Ativo Habitual
            </button>
            <button
              type="button"
              onClick={() => setIsMissedDaySimulated(true)}
              className={`px-4 py-2 rounded-full transition-all ${
                isMissedDaySimulated
                  ? 'bg-vital-emerald text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ficou 2 Dias Sem Abrir o App
            </button>
          </div>
        </div>

        {/* Comparativo Visual Lado a Lado (Double-Bezel em Ambos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Lado A: Outros Apps (Punitivo & Estressante) */}
          <div className="p-1 rounded-[2.25rem] bg-red-950/20 border border-red-500/20 shadow-md flex flex-col">
            <div className="bg-surface-base rounded-[2rem] p-8 flex-1 flex flex-col justify-between border border-white/5">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-500/20">
                  <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-bold">
                    ✕ Apps Tradicionais de Hábitos
                  </span>
                  <span className="text-xs font-mono text-zinc-500">Mecânica de Culpa</span>
                </div>

                <div className="bg-red-950/30 border border-red-500/30 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-sans font-bold text-red-300 text-lg">
                      {isMissedDaySimulated
                        ? 'Você perdeu sua sequência de 12 dias!'
                        : 'Mantenha o fogo aceso ou perca tudo!'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                    {isMissedDaySimulated
                      ? 'Contador zerado para 0. Notificações vermelhas insistentes que geram sensação de fracasso e inadequação.'
                      : 'Pressão constante para não quebrar a sequência diária a qualquer custo.'}
                  </p>
                  <div className="font-mono text-sm text-red-400 bg-red-950/60 px-3 py-1.5 rounded-lg inline-block">
                    {isMissedDaySimulated ? 'Streak: 0 dias (Zerado)' : 'Streak em Risco!'}
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-500 italic pt-4 border-t border-white/5">
                Resultado psicológico: Ansiedade, frustração e desinstalação em até 14 dias.
              </div>
            </div>
          </div>

          {/* Lado B: everMind (Gentle Fallback & Acolhimento) */}
          <div className="p-1.5 rounded-[2.25rem] bg-emerald-950/20 border border-emerald-500/30 shadow-xl flex flex-col">
            <div className="bg-surface-base rounded-[2rem] p-8 flex-1 flex flex-col justify-between border border-white/[0.08]">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-500/20">
                  <span className="text-xs font-mono uppercase tracking-wider text-vital-emerald font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-vital-emerald" />
                    everMind (Gentle Fallback)
                  </span>
                  <span className="text-xs font-mono text-vital-emerald font-semibold">
                    Anti-Culpa Canônica
                  </span>
                </div>

                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🌱</span>
                    <span className="font-sans font-bold text-emerald-200 text-lg">
                      {isMissedDaySimulated
                        ? 'Tudo bem! Cada dia tem seu próprio ritmo.'
                        : 'Bom dia! O que gostaria de fazer hoje?'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed mb-4">
                    {isMissedDaySimulated
                      ? 'Hoje é uma nova oportunidade para cuidar de você. Seu Cérebro Virtual permanece no estágio conquistado.'
                      : 'Três sugestões leves preparadas com carinho para o seu momento.'}
                  </p>
                  <div className="font-mono text-sm text-vital-emerald bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-lg inline-flex items-center gap-2">
                    <span>Progresso Vitalício Preservado:</span>
                    <strong className="text-white">34 Conquistas</strong>
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-300 italic pt-4 border-t border-white/5 flex items-center gap-2">
                <span className="text-vital-emerald">✓</span>
                <span>Resultado comprovado: Paz de espírito, apego emocional e constância sem estresse.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
