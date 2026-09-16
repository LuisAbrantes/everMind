import * as React from 'react';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './HeroSection';
import { PillarsBentoGrid } from './PillarsBentoGrid';
import { ZeroGuiltComparison } from './ZeroGuiltComparison';
import { SeniorErgonomicsShowcase } from './SeniorErgonomicsShowcase';
import { TestimonialsSection } from './TestimonialsSection';
import { ConversionCtaSection } from './ConversionCtaSection';
import { LandingFooter } from './LandingFooter';

export interface LandingPageProps {
  onOpenAppShowcase?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAppShowcase = () => {
    window.location.href = 'evermind_app_showcase.html';
  },
}) => {
  return (
    <div
      className="min-h-[100dvh] bg-[#09090B] text-zinc-100 font-sans selection:bg-vital-emerald/30 selection:text-white"
    >
      {/* Barra de Navegação Flutuante ("Floating Island") */}
      <LandingHeader
        onCtaClick={onOpenAppShowcase}
      />

      {/* Conteúdo Principal da Landing Page */}
      <main>
        {/* 1. Hero com Proposta de Valor e Cérebro Virtual Interativo */}
        <HeroSection
          onOpenAppShowcase={onOpenAppShowcase}
        />

        {/* 2. Bento Grid Assimétrico dos 4 Pilares da Longevidade */}
        <PillarsBentoGrid />

        {/* 3. Filosofia Anti-Culpa (ADR-0003) & Comparador Visual */}
        <ZeroGuiltComparison />

        {/* 4. Ergonomia Sênior & Acessibilidade WCAG AAA (ADR-0005) */}
        <SeniorErgonomicsShowcase />

        {/* 5. Depoimentos Multigeracionais */}
        <TestimonialsSection />

        {/* 6. Conversão Magnética Final com Baixa Fricção */}
        <ConversionCtaSection
          onOpenAppShowcase={onOpenAppShowcase}
        />
      </main>

      {/* Rodapé Canônico */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
