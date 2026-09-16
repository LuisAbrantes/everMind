---
name: mobile-ui-ux-design
description: Design system ideation, wireframing, senior-friendly ergonomics, and interactive mockup generation for React Native (TypeScript) mobile applications. Use when designing mobile UI concepts, comparing visual design proposals, or generating interactive smartphone screen prototypes.
---

# Mobile UI/UX Design & Senior Ergonomics Skill

Esta skill orienta o processo de ideação visual, arquitetura de informação e prototipagem de interfaces móveis em **React Native + TypeScript**, com foco estrito em **acessibilidade sênior (WCAG AAA)** e **psicologia positiva / gamificação acolhedora**.

---

## 🎯 Princípios Fundamentais de Design Sênior

1. **Escala Tipográfica & Dynamic Type:**
   * Corpo de texto principal: $\ge 18\text{sp}$ (ideal $20\text{sp}$ para leitura confortável).
   * Títulos e destaques: $24\text{sp}$ a $32\text{sp}$ com alto peso visual (`font-weight: 700+`).
   * Nunca truncar textos essenciais com reticências sem opção de expandir.

2. **Áreas de Toque & Feedback Háptico:**
   * Área mínima de toque: $48 \times 48\text{dp}$ (botões de ação primária em $56\text{dp}$ ou $64\text{dp}$).
   * Espaçamento entre botões: mínimo $12\text{dp}$ para evitar toques acidentais.
   * Feedback tátil (Haptics) em todas as confirmações de conclusão.

3. **Taxa de Contraste de Cores (WCAG AAA):**
   * Relação de contraste mínima de $7:1$ para textos normais sobre seus fundos.
   * Não confiar apenas na cor para transmitir estado (usar ícones + textos explícitos).

4. **Metáforas Visuais Acolhedoras:**
   * Evitar temporizadores de pânico (barras vermelhas piscando).
   * Recompensar o esforço de forma cumulativa com micro-celebrações e evolução monótona do Cérebro Virtual.

---

## 🛠️ Procedimento de Execução do Agente de Design

1. **Passo 1: Leitura de Contexto:**
   * Ler `CONTEXT.md` e `docs/DECISIONS.md` para respeitar as restrições arquiteturais.
   * Mapear os 4 pilares (Mente, Movimento, Autocuidado, Conexão) e a tela sob análise.

2. **Passo 2: Geração de 3 Propostas Visuais Distintas:**
   * **Proposta A (Warm Minimalist & High Contrast):** Foco cirúrgico em legibilidade, cartões de alto relevo e navegação elementar.
   * **Proposta B (Playful Longevity & Gamified Garden):** Foco na metáfora viva do jardim e cérebro que floresce, com cores vivas e acolhedoras.
   * **Proposta C (Nordic Zen & Gentle Rhythm):** Foco em calmaria, formas orgânicas suaves e ritmo sem pressa.

3. **Passo 3: Geração de Mockups Interativos em HTML:**
   * Construir um arquivo HTML contendo simulação em moldura de smartphone com alternância interativa entre as propostas e telas.
   * Permitir testes de clique, estados de conclusão e visualização em tamanho real.

4. **Passo 4: Validação com o Usuário e Transposição para React Native:**
   * Apresentar os mockups para aprovação de estilo.
   * Extrair os tokens de design (cores, tipografia, espaçamentos) para o Design System em `src/ui/`.
