import * as React from 'react';
import { Testimonial } from './types';

const TESTIMONIALS: readonly Testimonial[] = [
  {
    id: '1',
    author: 'Dra. Beatriz Albuquerque',
    role: 'Médica Geriatra e Especialista em Neuroplasticidade',
    avatarText: 'BA',
    quote:
      'A eliminação de punições por sequência é um avanço clínico imenso. O everMind gera constância real porque acolhe o tempo do idoso em vez de impor ansiedade.',
    highlightPillar: 'mind',
  },
  {
    id: '2',
    author: 'Helena Matos',
    age: 72,
    role: 'Professora Aposentada e Usuária Diária',
    avatarText: 'HM',
    quote:
      'Pela primeira vez um aplicativo não parece um exame médico. Os botões são fáceis de apertar, as letras são grandes e adoro ligar para os meus netos.',
    highlightPillar: 'connection',
  },
  {
    id: '3',
    author: 'Rodrigo Silveira',
    role: 'Filho e Cuidador Familiar',
    avatarText: 'RS',
    quote:
      'Minha mãe de 76 anos agora caminha seus dez minutos todos os dias e se diverte com as palavras. Ela se sente no controle da própria saúde mental.',
    highlightPillar: 'movement',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="depoimentos" className="py-24 lg:py-32 relative bg-zinc-950/40">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white mb-4">
            Aprovado por especialistas. Amado por famílias.
          </h2>
          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed">
            Veja como o respeito ao ritmo próprio transforma a relação de idosos e
            cuidadores com o cuidado diário da mente.
          </p>
        </div>

        {/* Testimonials Grid (Double-Bezel) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="p-1.5 rounded-[2.25rem] bg-white/[0.04] border border-white/10 shadow-lg flex flex-col"
            >
              <div className="bg-surface-base rounded-[2rem] p-8 flex-1 flex flex-col justify-between border border-white/[0.06]">
                {/* Quote Text — Máx 3 linhas para leitura instantânea */}
                <div>
                  <div className="text-vital-emerald text-3xl font-sans font-bold mb-4 leading-none select-none">
                    “
                  </div>
                  <p className="text-base sm:text-lg text-zinc-200 leading-relaxed mb-6 font-normal">
                    {item.quote}
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                  <div className="w-11 h-11 rounded-full bg-surface-elevated border border-white/15 flex items-center justify-center font-mono font-bold text-sm text-vital-cyan">
                    {item.avatarText}
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-sm text-white">
                      {item.author}
                      {item.age ? `, ${item.age} anos` : ''}
                    </h4>
                    <p className="font-sans text-xs text-zinc-400">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
