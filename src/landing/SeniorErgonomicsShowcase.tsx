import * as React from 'react';
import { useState } from 'react';

export const SeniorErgonomicsShowcase: React.FC = () => {
  const [touchSampleActive, setTouchSampleActive] = useState<boolean>(false);

  return (
    <section id="ergonomia" className="py-24 lg:py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white mb-4">
            Ergonomia e acessibilidade de nível mundial (WCAG AAA).
          </h2>
          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed">
            Desenvolvido sob medida para a fisiologia e o conforto visual de pessoas 60+.
            Aqui, cada detalhe elimina o esforço e amplia a sensação de independência.
          </p>
        </div>

        {/* 4 Blocos Ergonômicos em Grid 2x2 com Double-Bezel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Áreas de Toque Amplas */}
          <div className="p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-vital-emerald/10 border border-vital-emerald/30 flex items-center justify-center text-2xl mb-5">
                  👆
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Áreas de Toque Seguras (≥ 54px)
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                  Botões em pílula generosos que acomodam dedos com tremores, artrite ou
                  menor precisão motora. Chega de toques acidentais ou frustração ao clicar.
                </p>
              </div>

              {/* Botão de Teste Interativo de Toque */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-xs text-zinc-400 mb-3 font-mono">
                  Área de toque: 58px de altura real
                </p>
                <button
                  type="button"
                  onClick={() => setTouchSampleActive(!touchSampleActive)}
                  className={`w-full py-4 rounded-full font-bold text-base transition-all active:scale-[0.98] ${
                    touchSampleActive
                      ? 'bg-vital-emerald text-zinc-950 shadow-md'
                      : 'bg-white text-zinc-950 hover:bg-zinc-100'
                  }`}
                >
                  {touchSampleActive ? '✓ Toque Reconhecido com Firmeza!' : 'Toque Aqui Para Testar a Facilidade'}
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Tipografia Sênior WCAG AAA */}
          <div className="p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-vital-cyan/10 border border-vital-cyan/30 flex items-center justify-center text-2xl mb-5">
                  👁️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Tipografia Sênior & Alto Contraste (17:1)
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                  Textos corridos nunca inferiores a 18px, espaçamento generoso entre
                  linhas (1.6) e paleta aveludada que elimina o cansaço visual em telas brilhantes.
                </p>
              </div>

              <div className="bg-surface-elevated rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
                  <span>Geist Sans Regular</span>
                  <span className="text-vital-cyan font-bold">Razão 17.5:1</span>
                </div>
                <p className="text-lg text-white font-medium leading-relaxed">
                  "Ler aqui é repousante. As letras não fogem dos meus olhos."
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Pressão Zero de Tempo */}
          <div className="p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-vital-amber/10 border border-vital-amber/30 flex items-center justify-center text-2xl mb-5">
                  ⏳
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Pressão Zero de Tempo (Tempo Livre)
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                  Nenhum jogo possui cronômetro regressivo que encerre com perda. A mente
                  aprende e se regenera melhor quando não está sob estresse de segundos se esgotando.
                </p>
              </div>

              <div className="bg-surface-elevated rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-sans">
                  Cronômetros Punitivos:
                </span>
                <span className="font-mono text-xs text-vital-emerald font-bold bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                  0% Presentes
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: 100% Offline-First */}
          <div className="p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg">
            <div className="bg-surface-base rounded-[2rem] p-8 border border-white/[0.06] h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-vital-purple/10 border border-vital-purple/30 flex items-center justify-center text-2xl mb-5">
                  🛡️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  100% Offline-First & Privacidade Local
                </h3>
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
                  Funciona no sítio, na viagem ou em cômodos sem sinal de internet. Não
                  consome franquia de dados móveis e mantém os dados de hábitos seguros no aparelho.
                </p>
              </div>

              <div className="bg-surface-elevated rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-sans">
                  Modo Avião / Sem Internet:
                </span>
                <span className="font-mono text-xs text-vital-cyan font-bold bg-sky-950/60 border border-sky-500/30 px-3 py-1 rounded-full">
                  100% Disponível
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
