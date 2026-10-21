# 🧠 everMind

> **Estimulação Cognitiva, Bem-Estar e Longevidade Ativa para o Público Sênior**  
> *Construído com React Native, TypeScript (modo estrito), NativeWind v4 (TailwindCSS), Padrão shadcn/ui (React Native Reusables) e Supabase.*

[![Testes Automatizados](https://img.shields.io/badge/Testes%20Jest-66%20aprovados-success?style=for-the-badge&logo=jest)](./docs/DOCUMENTACAO_EXECUTIVA_E_TECNICA.md)
[![Acessibilidade](https://img.shields.io/badge/Acessibilidade-WCAG%202.1%20AAA-blue?style=for-the-badge)](./docs/DECISIONS.md)
[![Design System](https://img.shields.io/badge/Tema-Black%20%26%20White%20Monocromático-black?style=for-the-badge)](./tailwind.config.js)
[![Tipografia](https://img.shields.io/badge/Tipografia-Geist%20Sans%20%26%20Mono-white?style=for-the-badge)](./tailwind.config.js)

> ## 🌐 Versão PWA (mobile-first) — app principal para testes na web
> O app agora também existe como **PWA em HTML/CSS/JS puros** em [`web/`](./web/README.md): sem build, abre no navegador (inclusive nos computadores da escola) e pode ser instalado na tela inicial do celular.
> ```bash
> python3 -m http.server 8080 --directory web   # abra http://localhost:8080
> cd web/tests && npm install && npm test        # 528 testes e2e (Chromium + WebKit)
> ```
> Deploy: o workflow `.github/workflows/pages.yml` publica `web/` no GitHub Pages. A versão React Native abaixo permanece como referência.

---

## 🌟 Sobre o Projeto

O **everMind** é um ecossistema mobile projetado especialmente para pessoas maduras e seniores que buscam preservar a agilidade mental, manter o corpo ativo e consolidar hábitos saudáveis diários.

Regido pela filosofia da **Gamificação Acolhedora** (*Gentle Gamification*), o aplicativo elimina completamente a ansiedade, contadores agressivos e mensagens de culpa por dias inativos. O progresso é sempre cumulativo e o usuário é acolhido no seu próprio ritmo.

---

## 🌿 Os 4 Pilares da Longevidade Saudável

1. **🧠 Pilar Mente (*Neuroestimulação*):** Mini-jogos rápidos de memória, raciocínio lógico, linguagem, atenção e música sem temporizadores estressantes.
2. **🚶 Pilar Movimento (*Mobilidade & Vitalidade*):** Caminhadas suaves de 10 minutos (na rua, quintal ou sala de casa) com cronômetro compassivo opcional.
3. **💧 Pilar Autocuidado (*Nutrição, Hidratação & Sono*):** Registro fácil de copos d'água, incentivo à inclusão de frutas/vegetais e rituais relaxantes para o sono.
4. **❤️ Pilar Conexão (*Vínculo Afetivo*):** Convite caloroso para ligar ou conversar com amigos e familiares (*"Como foi o seu dia hoje?"*), combatendo o isolamento social.

---

## 📱 As 7 Telas do Aplicativo

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                               everMind (7 Telas)                                 │
├───────────────────┬──────────────────────────────────┬───────────────────────────┤
│ Tela              │ Descrição e Funcionalidades      │ Módulos de Domínio & Seam │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 1. Home / Bom Dia │ Tríade do Dia + Cérebro Virtual  │ BrainEvolutionEngine      │
│                   │ Gentle Streak (Anti-Culpa)       │ GentleStreakManager       │
│                   │ Sorteio dos 4 Pilares            │ DailyTriadCoordinator     │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 2. Ginástica      │ 5 Mini-Jogos Cognitivos          │ MemoryGameEngine          │
│    Cerebral       │ (Memória, Sequência, Palavras,   │ SequenceGameEngine        │
│                   │ Atenção/Diferenças, Música)      │ WordsGameEngine           │
│                   │                                  │ AttentionGameEngine       │
│                   │                                  │ MusicGameEngine           │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 3. Mexa o Corpo   │ Caminhada Suave de 10 min        │ HabitsCoordinator         │
│                   │ Cronômetro Compassivo Opcional   │ (Pilar Movimento)         │
│                   │ Conclusão Direta sem Burocracia  │                           │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 4. Cuide de Você  │ Hora da Água (Contador de Copos) │ HabitsCoordinator         │
│                   │ Missão Prato Colorido (Frutas)   │ (Pilar Autocuidado)       │
│                   │ Boa Noite (Higiene do Sono)      │                           │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 5. Desafio da     │ "Como foi o seu dia hoje?"       │ SocialCoordinator         │
│    Conexão        │ [ EU VOU LIGAR ]                 │ (Pilar Conexão)           │
│                   │ [ LEMBRAR MAIS TARDE ] (Sem Culpa│                           │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 6. Descubra Algo  │ 7 Categorias de Curiosidade      │ DiscoveryEngine           │
│    Novo           │ Botão [ 🎲 SURPREENDER-ME ]      │ (Catálogo 100% Offline)   │
│                   │ Roleta Lúdica sem flashes        │                           │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ 7. Minha Semana   │ Retrospectiva Afirmativa 4 Eixos │ WeeklySummaryCalculator   │
│                   │ Galeria de Badges / Conquistas   │ SupabaseSyncCoordinator   │
│                   │ Sincronização em Nuvem Supabase  │                           │
├───────────────────┼──────────────────────────────────┼───────────────────────────┤
│ Global Nav        │ Barra Inferior Acessível (64dp)  │ RootNavigator             │
│                   │ Conexão entre todas as abas      │                           │
└───────────────────┴──────────────────────────────────┴───────────────────────────┘
```

---

## 🎨 Diretrizes de Design & Acessibilidade Sênior (WCAG AAA)

* **Estilo Visual:** Monocromático de Alto Contraste (*Black & White / Dark Soft*), inspirado no padrão clássico do shadcn/ui.
  * Fundo principal: `#000000` / `#09090B`
  * Cartões e superfícies: `#121215` com bordas sutis e nítidas em `#27272A`
  * Textos: Branco de alto contraste `#FAFAFA` e cinza claro `#A1A1AA`
* **Tipografia Oficial:**
  * `Geist Sans`: Para títulos, botões e corpo do texto ($\ge 18\text{sp}$).
  * `Geist Mono`: Para contadores numéricos, sequências lógicas e streaks.
* **Ergonomia Sênior:**
  * Alvos de toque (*Touch Targets*) $\ge 54\text{dp}$ ($64\text{dp}$ nas ações principais).
  * Sem temporizadores regressivos punitivos ou telas de "Game Over".
  * Contraste cromático $\ge 10:1$, superando os requisitos WCAG AAA.

---

## 🚀 Como Inicializar e Executar o Projeto

### 1. Pré-requisitos
* **Node.js** (versão 18 LTS ou superior recomendada)
* **npm** ou **yarn**
* Navegador moderno (Chrome, Edge, Firefox, Safari)

### 2. Instalação das Dependências

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/LuisAbrantes/everMind.git
cd everMind
npm install
```

> **Nota para computadores com políticas restritas (Escolas / Laboratórios):**  
> Caso o Windows bloqueie a execução de scripts do PowerShell (`PSSecurityException`), execute com bypass de política:
> ```powershell
> powershell -ExecutionPolicy Bypass -Command "npm install --legacy-peer-deps"
> ```

---

### 3. Como Executar os Testes Automatizados (Jest / TDD)

O projeto possui **66 testes unitários em 27 suítes** cobrindo 100% dos motores de domínio, máquinas de estado e telas:

```bash
# Execução padrão dos testes:
npm test

# Ou diretamente via Jest:
npx jest

# No Windows regulamentado (PowerShell com restrições):
powershell -ExecutionPolicy Bypass -Command "npx jest"

# No Prompt de Comando clássico (CMD):
cmd /c npx jest
```

---

### 4. Como Testar no Navegador (Simulador Web Interativo)

Para visualizar e interagir com as 7 telas, os 5 mini-jogos, o contador de água e o sorteador de hobbies **imediatamente no navegador** (sem precisar de emuladores móveis pesados):

1. Dê um duplo clique no arquivo [`evermind_app_showcase.html`](./evermind_app_showcase.html) ou abra-o em qualquer navegador.
2. Você poderá alternar pelas abas na barra inferior, jogar as rodadas cognitivas e acompanhar a evolução do Cérebro Virtual em tempo real.

---

### 5. Configuração do Backend Supabase (Opcional para Nuvem)

O everMind é **100% Offline-First**, mas oferece sincronização em nuvem automática via Supabase.

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=sua-chave-anon-publica
```

---

## 🏛️ Estrutura Arquitetural (Deep Modules)

```
everMind/
├── src/
│   ├── modules/                         # Lógica de Domínio Pura e Seams
│   │   ├── domain/types.ts              # Tipos canônicos (Pillars, BrainStage, etc.)
│   │   ├── storage/                     # Seams de persistência (IStorageGateway, MMKV)
│   │   ├── feedback/                    # Seam de áudio e feedback háptico
│   │   ├── gamification/                # BrainEvolutionEngine, GentleStreakManager, Badges
│   │   ├── daily-triad/                 # DailyTriadCoordinator (Sorteio equilibrado)
│   │   ├── brain/                       # Os 5 Mini-Jogos (Memory, Sequence, Words, Attention, Music)
│   │   ├── habits/                      # HabitsCoordinator (Caminhada, Água, Frutas, Sono)
│   │   ├── social/                      # SocialCoordinator (Telefonema e Conexão Afetiva)
│   │   ├── discovery/                   # DiscoveryEngine (Catálogo Offline de Curiosidades)
│   │   ├── summary/                     # WeeklySummaryCalculator (Retrospectiva Positiva)
│   │   └── sync/                        # SupabaseSyncCoordinator (Sincronização em Nuvem)
│   ├── navigation/
│   │   └── RootNavigator.tsx            # Barra inferior acessível conectando as 7 telas
│   ├── screens/                         # Camada de Apresentação (Deep Modules)
│   │   ├── HomeScreen/                  # Tela 1: Bom Dia & Tríade do Dia
│   │   ├── BrainGymScreen/              # Tela 2: Ginástica para o Cérebro
│   │   ├── BodyMovementScreen/          # Tela 3: Mexa o Corpo
│   │   ├── SelfCareScreen/              # Tela 4: Cuide de Você
│   │   ├── SocialConnectionScreen/      # Tela 5: Desafio da Conexão
│   │   ├── DiscoveryScreen/             # Tela 6: Descubra Algo Novo
│   │   └── WeeklySummaryScreen/         # Tela 7: Minha Semana
│   ├── ui/
│   │   └── components/                  # Design System shadcn/RNR (Button, Card, Progress, Badge, Avatar)
│   └── lib/
│       └── supabase.ts                  # Cliente Supabase configurado
├── docs/                                # Documentação e Decisões Arquiteturais
│   ├── CONTEXT.md                       # Glossário canônico de domínio
│   ├── DECISIONS.md                     # ADRs 0001 a 0008
│   ├── CURRENT_STATE.md                 # Status de prontidão do sistema
│   └── DOCUMENTACAO_EXECUTIVA_E_TECNICA.md # Guia técnico e executivo completo
├── App.tsx                              # Ponto de entrada raiz React Native
├── evermind_app_showcase.html           # Simulador web interativo
└── tailwind.config.js                   # Configuração de tokens B&W e fontes Geist
```

---

## 📜 Licença

Este projeto é desenvolvido para fins educacionais e de promoção da longevidade ativa e saúde cognitiva.
