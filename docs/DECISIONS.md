# DECISIONS.md — Registro de Decisões Arquiteturais (ADRs)

Este documento registra as decisões arquiteturais fundamentais do projeto **everMind**, seus contextos, justificativas, consequências e regras de conformidade obrigatórias.

---

## Índice de ADRs

- [ADR-0001: React Native & TypeScript como Stack Mobile Principal](#adr-0001-react-native--typescript-como-stack-mobile-principal)
- [ADR-0002: Arquitetura de Armazenamento Offline-First com MMKV e Seam de Fallback](#adr-0002-arquitetura-de-armazenamento-offline-first-com-mmkv-e-seam-de-fallback)
- [ADR-0003: Psicologia Anti-Culpa e Mecânica de Gentle Fallback em Streaks](#adr-0003-psicologia-anti-culpa-e-mecânica-de-gentle-fallback-em-streaks)
- [ADR-0004: Framework de Agentes e Harnesses Universalmente Agnóstico](#adr-0004-framework-de-agentes-e-harnesses-universalmente-agnóstico)
- [ADR-0005: Acessibilidade Sênior Estrita e Conformidade com Padrões WCAG AAA](#adr-0005-acessibilidade-sênior-estrita-e-conformidade-com-padrões-wcag-aaa)

---

## ADR-0001: React Native & TypeScript como Stack Mobile Principal

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Time de Arquitetura everMind

### Contexto
O everMind necessita de uma aplicação mobile fluida, de alta fidelidade visual, com suporte a áudio reativo, feedback háptico, animações confortáveis e acessibilidade nativa em sistemas iOS e Android, sem impor complexidade desnecessária na base de código. O público sênior é altamente sensível a travamentos, lentidão na renderização e falta de suporte nativo a leitores de tela.

### Decisão
Adotar **React Native com TypeScript em modo estrito (`strict: true`)** como a base de engenharia do produto.
- A aplicação será estruturada com separação limpa de camadas: Domínio Puro, Casos de Uso/Aplicação, Adaptadores de Infraestrutura e Componentes de UI.
- O TypeScript servirá como primeira barreira de defesa contra estados inconsistentes em jogos cognitivos e controle de progresso.

### Consequências
- **Positivas:**
  - Código único para Android e iOS com aproveitamento de 95%+ de lógica de negócios.
  - Acesso direto às APIs nativas de acessibilidade (`AccessibilityInfo`, `accessibilityLabel`, `accessibilityHint`).
  - Excelente suporte a bibliotecas de haptics (`react-native-haptic-feedback`) e som (`react-native-sound` ou `expo-av`).
- **Negativas / Mitigações:**
  - Dependência de bridges nativas para módulos de áudio/storage $\rightarrow$ mitigada pelo isolamento em Seams/Interfaces de Gateway.

---

## ADR-0002: Arquitetura de Armazenamento Offline-First com MMKV e Seam de Fallback

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Time de Arquitetura everMind

### Contexto
O público sênior frequentemente utiliza dispositivos em locais sem conexão estável com a internet (chácaras, viagens, cômodos residenciais com sinal fraco) ou prefere não despender planos de dados móveis. Além disso, a privacidade do usuário quanto a hábitos diários, horas de sono e contatos sociais deve ser preservada localmente por padrão.

### Decisão
Adotar uma arquitetura **100% Offline-First**, utilizando **MMKV (`react-native-mmkv`)** como mecanismo de persistência síncrono de altíssima performance, encapsulado por uma interface genérica de repositório (`IStorageGateway`).
- Em ambientes de teste unitário ou plataformas de suporte, a interface fornecerá adaptadores em memória (`InMemoryStorageGateway`) ou fallback assíncrono (`AsyncStorageGateway`).
- Todas as transições de estado do Cérebro Virtual, histórico semanal, conquistas e configurações residem localmente no dispositivo.

### Consequências
- **Positivas:**
  - Inicialização instantânea do app (sub-milissegundo para carregar estado diário).
  - Funcionamento garantido no modo avião ou sem sinal de rede.
  - Testes unitários ultrarrápidos sem necessidade de emuladores ou bancos pesados.
- **Negativas / Mitigações:**
  - Caso o usuário troque de aparelho, os dados necessitariam de exportação manual ou backup futuro em nuvem opcional $\rightarrow$ planejado como recurso opt-in futuro.

---

## ADR-0003: Psicologia Anti-Culpa e Mecânica de Gentle Fallback em Streaks

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Especialistas em Psicologia Cognitiva, UX Sênior e Arquitetura

### Contexto
Aplicativos tradicionais de hábitos e jogos utilizam táticas agressivas de retenção baseadas em ansiedade (FOMO e punição por perda de *streak*). Para o público sênior e de saúde mental, mensagens que apontam fracasso (ex.: *"Você perdeu sua sequência de 7 dias"*, contadores zerados com avisos em vermelho) geram sensação de inadequação, ansiedade e culminam no descarte imediato do aplicativo.

### Decisão
Implementar a regra canônica de **Gentle Fallback / Psicologia Anti-Culpa**:
1. **Preservação Cumulativa:** O Cérebro Virtual acumula progresso total e **nunca regride de estágio**.
2. **Vocabulário Proibido:** Nenhuma tela, notificação ou componente de log pode utilizar palavras como *"perdeu"*, *"zerou"*, *"falhou"*, *"não atingiu a meta"* ou *"está atrasado"*.
3. **Padrão Obrigatório de Fallback:** Dias inativos são acolhidos com mensagens de renovação:
   - *"🌱 Tudo bem! Cada dia tem seu próprio ritmo. Hoje é uma nova oportunidade para cuidar de você."*
4. **Retrospectiva Semanal Afirmativa:** A Tela 7 exibe apenas totais executados, sem lacunas de "dias perdidos".

### Consequências
- **Positivas:**
  - Vínculo emocional de carinho e segurança com o produto.
  - Aumento da retenção de longo prazo sem dependência de mecânicas tóxicas.
- **Conformidade:**
  - Todo PR ou revisão de código que introduzir mensagens punitivas deve ser imediatamente rejeitado na fase de teste de aceitação de UX.

---

## ADR-0004: Framework de Agentes e Harnesses Universalmente Agnóstico

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Time de Arquitetura everMind

### Contexto
Assistentes de IA de código evoluem rapidamente (Claude, ChatGPT, Gemini, Cursor, Copilot, Codex, etc.). Amarrar a engenharia de prompts ou regras de arquitetura a uma ferramenta ou sintaxe proprietária gera obsolescência rápida e limita a portabilidade da equipe de desenvolvimento.

### Decisão
Estruturar o framework de governança em formato **100% Markdown canônico e agnóstico**:
- Localização em `.agents/` para Personas Especialistas (responsabilidades, regras e restrições) e `.agents/harnesses/` para Workflows e Protocolos de Execução.
- Todo harness possui passos determinísticos (`Contexto Obrigatório`, `Checklist de Validação`, `Passo a Passo de Engenharia`, `Critérios de Aceite`).
- A ordem de leitura obrigatória antes de qualquer modificação de código é universal:
  1. `docs/START_HERE.md`
  2. `docs/CURRENT_STATE.md`
  3. `docs/DECISIONS.md`
  4. O Harness correspondente à tarefa em `.agents/harnesses/`.

### Consequências
- **Positivas:**
  - Executável por qualquer IA ou engenheiro humano sem dependência de extensões proprietárias.
  - Reprodutibilidade consistente de decisões arquiteturais.

---

## ADR-0005: Acessibilidade Sênior Estrita e Conformidade com Padrões WCAG AAA

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Especialistas em Acessibilidade e Engenharia Front-end

### Contexto
Usuários seniores apresentam variações naturais na acuidade visual, coordenação motora fina, velocidade de processamento visual e audição. Interfaces com botões pequenos, contrastes baixos (cinza sobre branco), fontes finas ou temporizadores regressivos velozes tornam o aplicativo inacessível e hostil.

### Decisão
Adotar critérios de acessibilidade baseados no nível **WCAG 2.1 AAA** adaptados para mobile:
1. **Tipografia:** Tamanho mínimo de fonte para corpo de texto = **18sp/px**; títulos $\ge 22\text{sp/px}$. Peso tipográfico mínimo regular/médio (nunca ultralight ou thin).
2. **Área de Toque (*Touch Targets*):** Elementos interativos (botões, cards clicáveis, ícones) devem ter no mínimo **$48 \times 48\text{dp}$** (recomendado $56\text{dp}$ para ações principais).
3. **Contraste Cromático:** Razão de contraste mínima de **7:1** para texto normal e **4.5:1** para elementos gráficos essenciais sobre fundos escuros/claros.
4. **Pressão Zero de Tempo:** Nenhum mini-jogo ou desafio terá temporizador regressivo que encerre a partida com perda. O tempo é sempre livre.
5. **Feedback Multissensorial:** Ações de sucesso combinam retorno visual claro, animação suave, áudio melódico agradável e pulso háptico sutil.

### Consequências
- **Positivas:**
  - Usabilidade excelente para pessoas de todas as idades e com limitações visuais/motoras.
  - Conformidade com as melhores práticas mundiais de design inclusivo.

---

- [ADR-0006: Adoção do React Native Reusables (shadcn/ui para mobile) e Material Design 3](#adr-0006-adoção-do-react-native-reusables-shadcnui-para-mobile-e-material-design-3)
- [ADR-0007: Escolha da Direção Visual do Produto — Variante C (Nordic Zen & Gentle Rhythm) com Tipografia Geist](#adr-0007-escolha-da-direção-visual-do-produto--variante-c-nordic-zen--gentle-rhythm-com-tipografia-geist)

---

## ADR-0006: Adoção do React Native Reusables (shadcn/ui para mobile) e Material Design 3

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Time de Engenharia Front-end & Mobile

### Contexto
A equipe possui forte familiaridade com o padrão de componentes da web baseado no **shadcn/ui** (componentes copiáveis, customizáveis via classes TailwindCSS/NativeWind, sem dependência de bibliotecas de UI engessadas). No mobile, precisamos dessa mesma agilidade de desenvolvimento combinada com as regras de acessibilidade e elevações do **Material Design 3 (Material You)** para o público sênior.

### Decisão
Adotar o **React Native Reusables (RNR)** com **NativeWind v4 (TailwindCSS para React Native)** como biblioteca base de componentes de interface:
1. **Modelo shadcn/ui:** Os componentes residem diretamente no código do projeto (`src/ui/components/`), podendo ser ajustados conforme necessário (`Button`, `Card`, `Progress`, `Avatar`, `Dialog`, `Tabs`).
2. **Estilização com Tailwind & Tokens Material 3:** Uso de classes utilitárias tipadas com tokens de contraste sênior (`className="bg-card p-6 rounded-2xl border border-border min-h-[56px]"`).
3. **Acessibilidade Embutida:** Primitivos acessíveis derivados do Radix adaptados para React Native (RN Primitives), garantindo foco, rótulos de leitor de tela e áreas de toque $\ge 48\text{dp}$.

### Consequências
- **Positivas:**
  - Curva de aprendizado zero para desenvolvedores vindos do ecossistema web / shadcn.
  - Controle total sobre o código dos componentes sem *vendor lock-in*.
  - Facilidade para manter conformidade com WCAG AAA e Material Design 3.

---

## ADR-0007: Escolha da Direção Visual do Produto — Variante C (Nordic Zen & Gentle Rhythm) com Tipografia Geist

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Product Lead (Luís) e Time de Design/Engenharia

### Contexto
Após avaliação das 3 variantes conceituais geradas via skill `prototype` (`UI.md`) no showcase `evermind_design_proposals.html`, a equipe precisava definir a identidade visual oficial para guiar o Design System em React Native.

### Decisão
Adotar a **Variante C (Nordic Zen & Gentle Rhythm)** como padrão visual oficial do **everMind**:
1. **Estética Zen & Orgânica:** Fundo escuro suave (`#0D1117` e superfícies `#161B22`), cantos ultra-arredondados em pílula (`rounded-3xl` e `rounded-full` para botões e badges), transmitindo calma e ritmo sem pressa.
2. **Tipografia Geist Oficial:** **Geist Sans** para toda a interface e títulos com pesos bem delineados; **Geist Mono** para números, contadores e sequências lógicas.
3. **Mascote do Cérebro Circular:** Avatar circular zen (`🧠`) com elevação aveludada e anel de progresso discreto.
4. **Botões em Pílula Acessíveis:** Botões principais no formato pílula com altura de $54\text{dp}$ a $64\text{dp}$, contraste claro e toque suave.

### Consequências
- **Positivas:**
  - Identidade visual acolhedora, minimalista e premium, alinhada à psicologia anti-culpa.
  - Excelente legibilidade com a Geist Sans e contraste em conformidade com WCAG AAA.
  - Facilidade de implementação através de classes NativeWind (`rounded-full`, `bg-slate-900`, `text-slate-100`).

---

## ADR-0008: Integração do Backend com Supabase (Postgres, Auth, Storage e Sync)

- **Status:** Aprovado
- **Data:** Agosto de 2026
- **Decisores:** Time de Arquitetura & Backend

### Contexto
O everMind necessita de uma camada de backend gerenciada para backup em nuvem, sincronização de progresso do usuário, autenticação segura e banco de dados relacional Postgres escalável com suporte a RLS (Row Level Security).

### Decisão
Adotar o **Supabase** como plataforma de backend com suporte a **Expo React Native**:
1. **Cliente Mobile:** `@supabase/supabase-js` com `react-native-url-polyfill` e persistência de sessão via `AsyncStorage` em `src/lib/supabase.ts`.
2. **Chaves Públicas Seguras:** Variáveis prefixadas com `EXPO_PUBLIC_` (`EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_KEY`) armazenadas no `.env` do app.
3. **Skills Oficiais de Engenharia Supabase:** Adoção de `supabase` e `supabase-postgres-best-practices` para modelagem de banco, RLS e índices.

### Consequências
- **Positivas:**
  - Integração nativa e rápida com Expo / React Native.
  - Segurança reforçada por RLS direto no Postgres.
  - Manutenção simples com migrations declarativas.
