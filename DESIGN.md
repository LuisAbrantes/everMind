# DESIGN.md — Design System Semântico Canônico: everMind

> **Status:** Canônico / Ativo  
> **Versão:** 2.0.0 (Refatoração com Taste-Skill, Stitch Semantic Design & High-End Agency Architecture)  
> **Estilo Oficial:** Variante C (Nordic Zen & Gentle Rhythm) calibrada para Longevidade Cognitiva e Ergonomia WCAG AAA  
> **Dials da Taste-Skill:** `DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 4` · `VISUAL_DENSITY: 3`

---

## 1. Design Read & Filosofia da Atmosfera

```
│ "Design Read: Landing page & brand system para um ecossistema de longevidade cognitiva e bem-estar sênior 
│ (60+ e filhos/cuidadores), com linguagem Nordic Zen & Gentle Rhythm, unindo neurociência, afeto e ergonomia WCAG AAA."
```

O **everMind** transcende o paradigma tradicional de aplicativos de produtividade e treinamento cerebral. Ele é um refúgio digital de serenidade, dignidade e clareza mental. A atmosfera visual combina a serenidade austera do design escandinavo (*Nordic Zen*) com a cadência suave e acolhedora de rituais diários (*Gentle Rhythm*).

### Calibração dos Três Dials da Taste-Skill

* **`DESIGN_VARIANCE: 7` (Assimetria Equilibrada & Ritmo Orgânico):**
  Rompimento categórico com a monotonia de 3 cartões simétricos idênticos. O layout adota Bento Grids dinâmicos de proporções assimétricas (ex.: células de destaque 8:4 e 7:5), com quebras intencionais de eixo visual e respiro generoso, mantendo a previsibilidade ergonômica essencial ao público sênior.

* **`MOTION_INTENSITY: 4` (Movimento Sereno & Biofílico):**
  Coreografia cinética suave baseada em física de molas lentas (`stiffness: 100`, `damping: 20`). Transições suaves que guiam o olhar sem provocar tontura, vertigem ou fadiga cognitiva. Conformidade integral e obrigatória com `prefers-reduced-motion`.

* **`VISUAL_DENSITY: 3` (Art Gallery Airy — Respiração Espacial Ampla):**
  Padrão de galeria de arte. Espaçamentos generosos entre seções (`py-24` a `py-36`), margens acolhedoras e no máximo 3 a 4 elementos conceituais por área de visualização. Cada ideia possui seu próprio horizonte espacial.

---

## 2. Disciplina Anti-Default & Erradicação do "AI Slop"

Para garantir um produto de calibre mundial ($150k+ Agency Standard), as seguintes práticas clichês de inteligência artificial são **terminantemente banidas**:

| Padrão Banido (AI Slop Cliché) | Razão do Banimento | Padrão Canônico Adotado (everMind Taste) |
| :--- | :--- | :--- |
| ❌ Fundo gradiente roxo/azul neon ("AI Glow") | Barateia a identidade, gera poluição visual e distrai | ✅ Fundo aveludado profundo Zinc-950 (`#09090B`) com relevo háptico sutil |
| ❌ Preto Puro (`#000000`) em superfícies | Cria contraste agressivo e cansaço visual em telas OLED | ✅ Camadas profundas de carvão e ardósia (`#09090B`, `#121215`, `#18181B`) |
| ❌ Grade de 3 cartões idênticos com ícones no topo | Falta de ritmo, aspecto de template amador e clichê LLM | ✅ Bento Grid assimétrico com hierarquia de peso e conteúdo orgânico |
| ❌ Tipografia Inter, Roboto ou Helvetica sem carisma | Inexpressiva, genérica e comum a 95% dos mockups de IA | ✅ Geist Sans (tracking refinado `-0.03em`) + Geist Mono para métricas |
| ❌ Texto truncado ou 5+ linhas em títulos principais | Destrói o escaneamento visual e confunde leitores 60+ | ✅ Manchetes concisas (máx. 2 linhas em desktop), corpo legível e direto |
| ❌ Contadores vermelhos de "streak perdido" ou alertas | Provoca ansiedade, vergonha e abandono (ADR-0003) | ✅ *Gentle Fallback* — Mensagens de acolhimento e celebração cumulativa |
| ❌ Botões finos com áreas de clique pequenas (< 44dp) | Inacessível para mãos com tremores ou artrite | ✅ Pílulas táteis com altura de $54\text{px}$ a $64\text{px}$ (área $\ge 48\times 48\text{dp}$) |
| ❌ Sombras pretas duras e borradas (`rgba(0,0,0,0.5)`) | Sujam a interface escurecendo o contraste | ✅ Sombras difusas matizadas na cor do fundo com bordas estruturais de 1px |

---

## 3. Arquitetura Cromática & Tokens Oficiais

A paleta de cores do everMind reflete a intersecção entre a neurobiologia e a natureza. As superfícies são aveludadas, e os acentos vitais possuem saturação rigorosamente calibrada ($\le 75\%$) para nunca ofuscar a visão do usuário sênior.

### 3.1. Neutros Aveludados (Superfícies & Contraste)

```scss
// Base Canvas e Superfícies Elevadas
$canvas-deep:        #09090B; // Zinc-950 aveludado (Fundo primordial)
$surface-base:       #121215; // Superfície de elevação 1 (Cards, painéis)
$surface-elevated:   #18181B; // Superfície de elevação 2 (Modais, menus, badges ativos)
$surface-subtle:     #27272A; // Zinc-800 para controles inativos e divisores

// Bordas Estruturais Sutis (Hairlines Hápticas)
$border-whisper:     rgba(255, 255, 255, 0.08); // Borda padrão de cards
$border-medium:      rgba(255, 255, 255, 0.14); // Destaque interativo e foco
$border-focus:       rgba(56, 189, 248, 0.50);  // Anel de foco acessível (Ciano)

// Tipografia e Contrastes (WCAG AAA >= 7:1)
$text-pure:          #FAFAFA; // Texto principal (Contraste 17.5:1 sobre Canvas Deep)
$text-secondary:     #D4D4D8; // Texto auxiliar sênior (Zinc-300, Contraste 11.2:1)
$text-muted:         #A1A1AA; // Metadados secundários e rótulos (Zinc-400, Contraste 7.1:1)
```

### 3.2. Acentos Vitais Calibrados (Os 4 Pilares da Longevidade)

Cada pilar do ecossistema possui uma cor com significado funcional, nunca puramente decorativa:

```scss
// 🌿 Esmeralda Vital — Pilar Mente & Longevidade Saudável
$emerald-vital:      #10B981; // Hex oficial
$emerald-soft:       rgba(16, 185, 129, 0.12); // Pílula de fundo

// 💧 Ciano Foco — Pilar Movimento & Clareza Cognitiva
$cyan-focus:         #38BDF8; // Hex oficial
$cyan-soft:          rgba(56, 189, 248, 0.12); // Pílula de fundo

// 🍯 Âmbar Acolhedor — Pilar Autocuidado & Calor Humano
$amber-warm:         #F59E0B; // Hex oficial
$amber-soft:         rgba(245, 158, 11, 0.12); // Pílula de fundo

// 🔮 Púrpura Zen — Pilar Conexão & Cérebro Virtual Permanente
$purple-zen:         #A855F7; // Hex oficial (sem brilho estridente)
$purple-soft:        rgba(168, 85, 247, 0.12); // Pílula de fundo
```

> **Regra de Consistência Cromática:** Em qualquer seção, utiliza-se no máximo um acento em posição de ação primária por vez. Cores de pilares funcionam como indicadores contextuais e nunca disputam a atenção do CTA principal.

---

## 4. Tipografia & Arquitetura de Leitura

O sistema tipográfico utiliza a família **Geist** criada pela Vercel/Basement Studios, combinando geometria humanista, proporções ópticas neutras e legibilidade de alto calibre.

### 4.1. Pilha Tipográfica Canônica (100% Geist)
- **Fonte Principal (Display & Corpo):** `Geist Sans` (`'Geist', sans-serif`) — Estritamente Geist em 100% dos elementos da interface.
- **Fonte Numérica & Métricas:** `Geist Mono` (`'Geist Mono', monospace`) — Estritamente Geist Mono em todos os números e contadores.

### 4.2. Escala & Hierarquia de Tipografia Sênior (WCAG AAA)

| Nível | Família | Tamanho / Line Height | Tracking | Aplicação & Função |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | Geist Sans | `clamp(2.5rem, 5vw, 4rem)` / 1.15 | `-0.035em` | Título principal da landing page (máx. 2 linhas) |
| **Heading 1 (H1)** | Geist Sans | `2.25rem (36px)` / 1.25 | `-0.03em` | Títulos das seções principais |
| **Heading 2 (H2)** | Geist Sans | `1.75rem (28px)` / 1.35 | `-0.025em` | Subtítulos e títulos de blocos no Bento Grid |
| **Heading 3 (H3)** | Geist Sans | `1.375rem (22px)` / 1.4 | `-0.02em` | Títulos de cartões e desafios individuais |
| **Corpo Sênior (Body)** | Geist Sans | `1.125rem (18px)` / 1.6 | `normal` | Parágrafos explicativos (mínimo $18\text{px}$ para leitura sem esforço) |
| **Corpo Amplo (Lead)** | Geist Sans | `1.25rem (20px)` / 1.6 | `-0.01em` | Textos de abertura e depoimentos empáticos |
| **Métrica / Contador** | Geist Mono | `2.5rem - 3.5rem` / 1.0 | `-0.02em` | Dias ativos, minutos de caminhada, desafios concluídos |
| **Etiqueta / Badge** | Geist Sans | `0.875rem (14px)` / 1.2 | `0.05em` | Rótulos de categoria em caixa alta suave, peso 600 |

### 4.3. Regras de Ouro Tipográficas
1. **Descender Clearance:** Todo título com itálico decorativo que possua letras descendentes (`g, j, p, q, y`) utiliza reserva inferior (`pb-1`) para evitar cortes ópticos.
2. **Largura Máxima de Linha:** Textos de corpo nunca ultrapassam `65ch` de largura para evitar fadiga ocular na troca de linha.
3. **Eyebrow Restraint:** No máximo **1 eyebrow tag a cada 3 seções**. A landing page não satura o visitante com pequenos selos em cima de cada manchete.

---

## 5. Ergonomia dos Componentes & Relevo Tátil

Seguindo o princípio de *Senior Ergonomics* e *High-End Agency Craft*, os componentes utilizam a arquitetura de **Relevo Tátil Duplo (Double-Bezel Architecture)** e superfícies físicas reconhecíveis.

### 5.1. Botões em Pílula (Tactile Pill Architecture)
- **Formato:** Totalmente arredondados (`rounded-full`).
- **Altura Ergonômica:** Entre $54\text{px}$ e $64\text{px}$ (garantindo área mínima de toque $\ge 48\times 48\text{dp}$).
- **Variações Canônicas:**
  - **Primário (Ação Decisiva):** Fundo Branco Puro (`#FAFAFA`), Texto Carvão (`#09090B`), peso 600, micro-deslocamento tátil de `-1px` no hover e `scale(0.98)` no toque/clique.
  - **Secundário (Acolhimento):** Fundo `$surface-elevated` (`#18181B`), borda `$border-whisper`, texto `$text-pure`, hover sutil `$border-medium`.
  - **Padrão "Button-in-Button":** Quando um botão possui ícone direcionador (ex.: seta `→` ou ícone de pilar), o ícone fica acondicionado em sua própria micro-célula circular concêntrica dentro da pílula.

### 5.2. Cartões & Contêineres (Rounded-3xl & Double-Bezel)
- **Raio de Curvatura:** Cantos generosos com raio de $24\text{px}$ a $32\text{px}$ (`rounded-3xl` / `rounded-[28px]`).
- **Arquitetura Double-Bezel (Doppelrand):**
  1. **Envoltório Externo (Shell):** Borda externa ultrafina `rgba(255, 255, 255, 0.08)` com background translúcido suave.
  2. **Núcleo Interno (Core):** Superfície sólida `#121215`, raio concêntrico proporcional e destaque interno superior de 1px (`shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]`).
- **Espaçamento Interno:** Padding amplo (`p-8` a `p-10`), impedindo elementos de tocarem as bordas.

### 5.3. Campos de Entrada (Form Controls Acessíveis)
- Rótulos sempre posicionados **acima** do campo, com tamanho $\ge 16\text{px}$ e peso semi-bold.
- Altura dos inputs: $56\text{px}$.
- Anel de foco evidente em `$cyan-focus` com espessura de 2px e offset de 2px.

---

## 6. Layout & Composição Espacial (Bento Grid Dinâmico)

A estrutura visual da Landing Page baseia-se em assimetria elegante, evitando blocos monótonos de mesma largura.

```
┌────────────────────────────────────────────────────────────┐
│                    BARRA DE TOPO SUSPENSA                  │
│                [ everMind ]  •  [ 4 Pilares ]  •  [ Acessar ]│
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                       HERO SECTION                         │
│  [ Esquerda: Proposta de Valor ] [ Direita: Cérebro Zen & ]│
│  - Longevidade sem Culpa         - Preview Tátil Mobile    │
│  - Tipografia 60+ Confortável    - Badge de Neuroplastic.  │
│  - CTAs Duplos Ergonômicos                                 │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│              FAIXA SOCIAL PROOF AFIRMATIVA                 │
│         "Recomendado por geriatras e amado por famílias"   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│            BENTO GRID DINÂMICO DOS 4 PILARES               │
│ ┌───────────────────────────────┬────────────────────────┐ │
│ │ PILAR MENTE (8 colunas)       │ PILAR MOVIMENTO (4 col)│ │
│ │ 5 Jogos Cognitivos Leves      │ Caminhada de 10 min    │ │
│ ├───────────────────────────────┼────────────────────────┤ │
│ │ PILAR AUTOCUIDADO (4 colunas) │ PILAR CONEXÃO (8 col)  │ │
│ │ Água, Fruta e Sono Zen        │ Afeto Sem Pressa       │ │
│ └───────────────────────────────┴────────────────────────┘ │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│       FILOSOFIA ZERO-GUILT (STREAK SEM CULPA)             │
│      Comparativo Visual: App Tradicional vs everMind       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│          CONVITE FINAL & CONVERSÃO MAGNÉTICA               │
│           "Comece hoje seu ritmo de tranquilidade"         │
└────────────────────────────────────────────────────────────┘
```

### Responsividade & Colapso Móvel (< 768px)
- Todos os layouts multi-coluna colapsam graciosamente para coluna única (`grid-cols-1`).
- Os botões mantêm largura total ou ajustada ao polegar (`w-full sm:w-auto`).
- Nunca utilizar `h-screen`; adotar estritamente `min-h-[100dvh]` para evitar saltos bruscos na barra de endereços do iOS Safari e Chrome Android.

---

## 7. Filosofia Cinética & Micro-Interações

A animação no everMind existe exclusivamente para **orientar, acolher e confirmar**, nunca para exibir artifícios desnecessários.

- **Mola Biofísica:** Configuração canônica de mola no Motion / CSS Transitions:
  ```json
  {
    "type": "spring",
    "stiffness": 100,
    "damping": 20,
    "mass": 1
  }
  ```
- **Micro-Interações Contínuas (Perpetual Calm):**
  - Respiração suave no Avatar do Cérebro Virtual (`scale: [1, 1.03, 1]` a cada 4 segundos).
  - Feedback tátil com contração mecânica no toque (`scale: 0.98`).
  - Entrada de elementos via revelação com fade-up sutil (`opacity: 0 -> 1`, `translateY: 16px -> 0px`).
- **Aceleração por GPU:** Animações restringem-se estritamente a `transform` e `opacity`, eliminando reflows e travamentos em celulares modestos.
- **Respeito a `prefers-reduced-motion`:** Quando o sistema operacional sinaliza redução de movimento, todas as transições tornam-se crossfades instantâneos sem deslocamento espacial.

---

## 8. Anti-Patterns & Regras Inegociáveis (Checklist Canônico)

Antes de aprovar qualquer componente ou tela da Landing Page, audite contra as seguintes regras:

1. **Anti-Culpa Universal:** É expressamente proibida a presença de palavras como *"perdeu"*, *"atrasado"*, *"fracasso"*, *"zerou"* ou ícones vermelhos de penalidade.
2. **Barreira de Toque Sênior:** Nenhum elemento clicável pode ter altura ou largura inferior a $48\text{dp}$ / $48\text{px}$.
3. **Padrão de Cor Única para Ação:** O botão de conversão primário possui um contraste único de destaque visual na página.
4. **Sem Falsos Mockups de Div:** Elementos visuais que simulam o aplicativo devem usar os componentes reais do sistema ou gráficos polidos, sem retângulos amadores com texto falso.
5. **Legibilidade Incondicional:** Textos de corpo nunca usam cinzas apagados que violem o contraste mínimo de 7:1 da WCAG AAA.

---

Este documento constitui a **Diretriz de Design Oficial e Canônica do everMind**, servindo de contrato para engenheiros, designers e modelos de inteligência artificial.
