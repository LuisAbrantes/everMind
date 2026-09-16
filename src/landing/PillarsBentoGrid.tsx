import * as React from 'react';
import { useState } from 'react';

export const PillarsBentoGrid: React.FC = () => {
  // Estados interativos para demonstrar a leveza de cada pilar
  const [sequenceGuess, setSequenceGuess] = useState<number | null>(null);
  const [waterCups, setWaterCups] = useState<number>(3);
  const [walkDone, setWalkDone] = useState<boolean>(false);
  const [callSimulated, setCallSimulated] = useState<boolean>(false);

  return (
    <section id="pilares" className="py-24 lg:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header (Sem eyebrow repetitivo — regra de restrição de eyebrows) */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white mb-4">
            Quatro pilares integrados para uma longevidade serena.
          </h2>
          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed">
            A neurociência comprova que a mente não se preserva isolada. Cada dia traz uma
            combinação equilibrada de 3 desafios suaves para o cérebro, corpo e coração.
          </p>
        </div>

        {/* Bento Grid Assimétrico (Linha 1: 8 + 4 | Linha 2: 4 + 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 🌿 CARD 1: PILAR MENTE (8 colunas) */}
          <div className="lg:col-span-8 p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 lg:p-10 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-vital-emerald border border-emerald-500/20">
                    🌿 Pilar 01 · Neuroplasticidade
                  </span>
                  <span className="text-xs font-mono text-zinc-400">5 Micro-Jogos</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                  Ginástica Cerebral Lúdica & Sem Pressa
                </h3>
                <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-[55ch] mb-8">
                  Exercícios rápidos de memória visual, sequências lógicas, vocabulário e
                  música afetiva. Sem cronômetros regressivos punitivos: você joga no seu
                  tempo e celebra a clareza.
                </p>
              </div>

              {/* Mini Demonstração Interativa: Sequência Lógica */}
              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Desafio Exemplo: Sequência Numérica
                  </span>
                  <span className="text-xs text-vital-emerald font-sans">
                    Qual é o próximo número?
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-300 px-4 py-2 rounded-xl bg-zinc-800 border border-white/5">
                    2
                  </span>
                  <span className="text-zinc-500 font-bold">→</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-300 px-4 py-2 rounded-xl bg-zinc-800 border border-white/5">
                    4
                  </span>
                  <span className="text-zinc-500 font-bold">→</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-zinc-300 px-4 py-2 rounded-xl bg-zinc-800 border border-white/5">
                    6
                  </span>
                  <span className="text-zinc-500 font-bold">→</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-vital-emerald px-4 py-2 rounded-xl bg-emerald-950/40 border border-vital-emerald/40 min-w-[56px] text-center">
                    {sequenceGuess !== null ? sequenceGuess : '?'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {[7, 8, 9].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSequenceGuess(val)}
                      className={`px-5 py-2.5 rounded-full font-mono text-sm font-semibold border transition-all active:scale-95 ${
                        sequenceGuess === val
                          ? val === 8
                            ? 'bg-emerald-400 text-emerald-950 font-bold border-emerald-300 shadow-sm'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-600'
                          : 'bg-zinc-800/80 text-zinc-200 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                  {sequenceGuess === 8 && (
                    <span className="text-xs text-vital-emerald font-semibold ml-2 animate-fade-in">
                      ✨ Excelente! Raciocínio afiado.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 💧 CARD 2: PILAR MOVIMENTO (4 colunas) */}
          <div className="lg:col-span-4 p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 lg:p-10 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sky-500/10 text-vital-cyan border border-sky-500/20">
                    💧 Pilar 02 · Corpo Ativo
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  Caminhada de 10 Minutos
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                  Mobilidade sem exigências atléticas intimidantes. Caminhadas leves na rua,
                  no quintal ou na sala com retorno háptico suave.
                </p>
              </div>

              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/10 text-center">
                <div className="text-4xl mb-3">🚶‍♂️</div>
                <div className="font-mono text-2xl font-bold text-white mb-1">
                  10:00 min
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  Meta gentil e estimulante
                </p>
                <button
                  type="button"
                  onClick={() => setWalkDone(!walkDone)}
                  className={`w-full py-3 px-4 rounded-full text-xs font-semibold transition-all ${
                    walkDone
                      ? 'bg-vital-cyan text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-200 border border-white/10 hover:border-vital-cyan'
                  }`}
                >
                  {walkDone ? '✓ Caminhada Concluída!' : 'Simular Conclusão de Caminhada'}
                </button>
              </div>
            </div>
          </div>

          {/* 🍯 CARD 3: PILAR AUTOCUIDADO (4 colunas) */}
          <div className="lg:col-span-4 p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 lg:p-10 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-vital-amber border border-amber-500/20">
                    🍯 Pilar 03 · Autocuidado
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">
                  Água, Prato Colorido & Sono
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                  Check-ins de 1 clique para hidratação frequente, nutrição com vegetais
                  e ritual para uma boa noite de repouso.
                </p>
              </div>

              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-zinc-300">Hora da Água</span>
                  <span className="font-mono text-xs text-vital-amber font-bold">
                    {waterCups} copos hoje
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-3 rounded-full transition-all ${
                        idx <= waterCups ? 'bg-vital-amber' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setWaterCups((prev) => (prev >= 5 ? 1 : prev + 1))}
                  className="w-full py-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-white/10 transition-all"
                >
                  + Beber um Copo d’Água
                </button>
              </div>
            </div>
          </div>

          {/* 🔮 CARD 4: PILAR CONEXÃO (8 colunas) */}
          <div className="lg:col-span-8 p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 lg:p-10 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-vital-purple border border-purple-500/20">
                    🔮 Pilar 04 · Conexão & Afeto
                  </span>
                  <span className="text-xs font-mono text-zinc-400">Antídoto à Solidão</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                  Laços Vivos: "Como foi o seu dia?"
                </h3>
                <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-[55ch] mb-8">
                  O afeto e a conversa ativa são os maiores protetores da cognição sênior.
                  O everMind convida a telefonar para um amigo ou familiar sem protocolos
                  frios, cultivando presença real e calor humano.
                </p>
              </div>

              {/* Caixa de Empatia Interativa */}
              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-950/60 border border-vital-purple/40 flex items-center justify-center text-2xl">
                    📞
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Desafio de Hoje: Ligar para Alguém Especial
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Uma conversa carinhosa de 5 minutos renova o ânimo de quem liga e de quem atende.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCallSimulated(true)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    callSimulated
                      ? 'bg-vital-purple text-white'
                      : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/10'
                  }`}
                >
                  {callSimulated ? '❤️ Ligação Realizada!' : 'Marcar como Concluído'}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
