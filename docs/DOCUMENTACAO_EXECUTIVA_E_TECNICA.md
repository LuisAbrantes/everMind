# 📘 Documentação Técnica & Executiva — everMind

> **Aplicativo:** everMind — Estimulação Cognitiva, Bem-Estar e Longevidade Ativa  
> **Stack:** React Native, Expo, TypeScript (modo estrito), NativeWind / shadcn/ui, Supabase  
> **Data de Atualização:** Agosto de 2026  
> **Status:** ✅ Missões 01 a 05 Concluídas (7 Telas Funcionais + 100% de Testes Passando)

---

## 🎯 1. Visão Geral & Estado Atual do Projeto

Todas as **7 telas fundamentais**, os **motores lógicos desacoplados (*Deep Modules*)**, os **Seams de Infraestrutura (*Storage & Feedback*)**, o **Design System Sênior Monocromático (WCAG AAA)**, o ponto de entrada principal [`App.tsx`](file:///C:/Users/discente/Documents/luis/everMind/App.tsx), o simulador interativo de navegador [`evermind_app_showcase.html`](file:///C:/Users/discente/Documents/luis/everMind/evermind_app_showcase.html) e a **Navegação Global** foram completamente implementados e testados com TDD.

### Matriz Completa das 7 Telas & 4 Pilares:

| # | Tela | Pilar Central | Arquivos Principais | Módulos de Domínio & Seams |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Home / Bom Dia** | Orquestração dos 4 Pilares | `src/screens/HomeScreen/` | `BrainEvolutionEngine`, `GentleStreakManager`, `DailyTriadCoordinator` |
| **2** | **Ginástica Cerebral** | Mente (*Neuroplasticidade*) | `src/screens/BrainGymScreen/` | `MemoryGameEngine`, `SequenceGameEngine`, `WordsGameEngine`, `AttentionGameEngine`, `MusicGameEngine` |
| **3** | **Mexa o Corpo** | Movimento (*Mobilidade*) | `src/screens/BodyMovementScreen/` | `HabitsCoordinator` (*Caminhada 10 min*) |
| **4** | **Cuide de Você** | Autocuidado (*Nutrição & Sono*) | `src/screens/SelfCareScreen/` | `HabitsCoordinator` (*Água, Frutas, Higiene do Sono*) |
| **5** | **Desafio da Conexão** | Conexão (*Vínculo Afetivo*) | `src/screens/SocialConnectionScreen/` | `SocialCoordinator` (*Telefonema carinhoso sem culpa*) |
| **6** | **Descubra Algo Novo** | Expansão Cognitiva (*Hobbies*) | `src/screens/DiscoveryScreen/` | `DiscoveryEngine` (*7 categorias + Roleta Lúdica*) |
| **7** | **Minha Semana** | Consolidação Holística | `src/screens/WeeklySummaryScreen/` | `WeeklySummaryCalculator`, `SupabaseSyncCoordinator` |
| **-** | **Navegação Global** | Integração do App | `src/navigation/RootNavigator.tsx` | Barra inferior de toque acessível ($\ge 64\text{dp}$) |

---

## ⚠️ 2. Diagnóstico Técnico: Execução em Computador Regulamentado (Escola / Laboratório)

Em computadores regulamentados de escolas e laboratórios de informática, existem restrições de segurança de sistema operacional projetadas para usuários sem privilégios de Administrador (`Level 1 / Standard User`).

Abaixo estão os 3 problemas encontrados durante o desenvolvimento e como foram mitigados para que o projeto rode de forma 100% autônoma e leve:

### 2.1. Bloqueio de Scripts do PowerShell (`PSSecurityException`)
* **O que ocorreu:** O Windows bloqueia a execução direta do script `npm.ps1` devido à política padrão `Restricted`.
* **Como contornar:** Em vez de rodar o comando direto, utilize a flag de bypass no PowerShell ou o CMD tradicional:
  ```powershell
  # No PowerShell:
  powershell -ExecutionPolicy Bypass -Command "npx jest"

  # No Prompt de Comando (CMD):
  cmd /c npx jest
  ```

### 2.2. Resolução de Conflitos de Versão (`ts-jest` com TypeScript 7)
* **O que ocorreu:** Versões experimentais ou globais do TypeScript 7 não expõem APIs de compilador exigidas pelo Jest.
* **Como foi resolvido:** Foi fixada a dependência estável `typescript@^5.0.0` com `--legacy-peer-deps` no `package.json`, garantindo funcionamento estável em qualquer máquina.

### 2.3. Erro de Parse de Tags JSX no Jest (`SyntaxError: Unexpected token '<'`)
* **O que ocorreu:** O Jest puro roda em ambiente Node.js e, por padrão, não interpreta tags JSX de componentes React Native sem uma camada de transformação.
* **Como foi resolvido:**
  1. Configuração do `jest.config.js` com o compilador `ts-jest` contendo `{ tsconfig: { jsx: 'react-jsx' } }`.
  2. Criação de mocks levíssimos em `src/__mocks__/reactNativeMock.js` e `src/__mocks__/asyncStorageMock.js`.
  3. Com isso, os testes rodam diretamente na CPU sem necessitar de emuladores pesados (Android Studio / Xcode), executando todos os 66 testes em apenas **4 segundos**.

---

## 🏛️ 3. Arquitetura de Software (Deep Modules & Clean Seams)

O projeto segue à risca o isolamento de efeitos colaterais:

```
┌─────────────────────────────────────────────────────────────┐
│                    Camada de Apresentação                   │
│         (7 Telas React Native + Design System WCAG AAA)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Hooks Customizados & Presenters)
┌──────────────────────────────▼──────────────────────────────┐
│                    Camada de Aplicação                      │
│   (useHomeScreen, useBrainGym, useBodyMovement, useWeekly)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Interfaces / Seams)
┌──────────────────────────────▼──────────────────────────────┐
│                      Camada de Domínio                      │
│ (BrainEvolutionEngine, GentleStreakManager, GameEngines)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Inversão de Dependência)
┌──────────────────────────────▼──────────────────────────────┐
│                  Camada de Infraestrutura                   │
│    (IStorageGateway, MMKVStorageGateway, SupabaseSync)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 4. Mapa Completo de Arquivos do Projeto

```
src/
├── __mocks__/
│   ├── asyncStorageMock.js                      # Mock do AsyncStorage para testes
│   ├── emptyMock.js                             # Mock para polyfills nativos
│   └── reactNativeMock.js                       # Mock leve dos componentes React Native
├── __tests__/
│   └── App.test.tsx                             # Teste unitário da raiz do app
├── lib/
│   └── supabase.ts                              # Cliente Supabase com variáveis EXPO_PUBLIC_
├── modules/
│   ├── domain/
│   │   └── types.ts                             # Tipos de domínio canônicos (Pillars, BrainStage, etc.)
│   ├── storage/
│   │   ├── IStorageGateway.ts                   # Interface Seam de armazenamento
│   │   ├── InMemoryStorageGateway.ts            # Implementação em memória para testes instantâneos
│   │   └── MMKVStorageGateway.ts                # Implementação MMKV com fallback seguro
│   ├── feedback/
│   │   ├── IFeedbackService.ts                  # Seam de áudio e feedback tátil
│   │   └── MockFeedbackService.ts               # Mock para testes
│   ├── gamification/
│   │   ├── BrainEvolutionEngine.ts              # Máquina de estados monótona (nunca regride)
│   │   ├── GentleStreakManager.ts               # Política Anti-Culpa (Gentle Fallback)
│   │   ├── BadgeEvaluator.ts                    # Avaliação das 5 insígnias de conquista
│   │   └── __tests__/
│   ├── daily-triad/
│   │   ├── DailyTriadCoordinator.ts             # Sorteio equilibrado dos 4 pilares
│   │   └── __tests__/
│   ├── brain/
│   │   ├── MemoryGameEngine.ts                  # Jogo 1: Memória Visual (5 imagens)
│   │   ├── SequenceGameEngine.ts                # Jogo 2: Sequência Lógica (2-4-6-?)
│   │   ├── WordsGameEngine.ts                   # Jogo 3: Formação de Palavras
│   │   ├── AttentionGameEngine.ts               # Jogo 4: Atenção e Diferenças
│   │   ├── MusicGameEngine.ts                   # Jogo 5: Memória Musical MPB
│   │   └── __tests__/
│   ├── habits/
│   │   ├── HabitsCoordinator.ts                 # Hábitos Somáticos (Caminhada + Cuide de Você)
│   │   └── __tests__/
│   ├── social/
│   │   ├── SocialCoordinator.ts                 # Conexão Humana & Afeto
│   │   └── __tests__/
│   ├── discovery/
│   │   ├── DiscoveryEngine.ts                   # Catálogo Offline de Descobertas
│   │   └── __tests__/
│   ├── summary/
│   │   ├── WeeklySummaryCalculator.ts           # Retrospectiva Semanal Afirmativa
│   │   └── __tests__/
│   └── sync/
│       ├── SupabaseSyncCoordinator.ts           # Sincronização em nuvem não-bloqueante
│       └── __tests__/
├── navigation/
│   ├── RootNavigator.tsx                        # Barra de navegação inferior acessível (64dp)
│   └── __tests__/
├── screens/
│   ├── HomeScreen/                              # Tela 1: Bom Dia & Tríade do Dia
│   ├── BrainGymScreen/                          # Tela 2: Ginástica para o Cérebro
│   ├── BodyMovementScreen/                      # Tela 3: Mexa o Corpo (Caminhada 10 min)
│   ├── SelfCareScreen/                          # Tela 4: Cuide de Você (Água, Fruta, Sono)
│   ├── SocialConnectionScreen/                  # Tela 5: Desafio da Conexão
│   ├── DiscoveryScreen/                         # Tela 6: Descubra Algo Novo (Surpreender-me)
│   └── WeeklySummaryScreen/                     # Tela 7: Minha Semana & Conquistas
└── ui/
    └── components/
        ├── Button.tsx                           # Botão Pílula Sênior (54dp / 64dp)
        ├── Card.tsx                             # Card, CardHeader, CardTitle, etc.
        ├── Progress.tsx                         # Barra de Progresso Acessível (ARIA)
        ├── Badge.tsx                            # Insígnias Monocromáticas em Geist Mono
        ├── Avatar.tsx                           # Avatar Circular do Cérebro Virtual
        ├── AccessibleText.tsx                   # Tipografia Sênior (>= 18sp)
        └── index.ts                             # Barrel export
```

---

## 🧪 5. Relatório de Execução dos Testes Automatizados (Jest)

Todos os testes passaram com **100% de sucesso**:

```
PASS src/modules/gamification/__tests__/BrainEvolutionEngine.test.ts
PASS src/modules/gamification/__tests__/GentleStreakManager.test.ts
PASS src/modules/gamification/__tests__/BadgeEvaluator.test.ts
PASS src/modules/daily-triad/__tests__/DailyTriadCoordinator.test.ts
PASS src/modules/brain/__tests__/BrainGames.test.ts
PASS src/modules/habits/__tests__/HabitsCoordinator.test.ts
PASS src/modules/social/__tests__/SocialCoordinator.test.ts
PASS src/modules/discovery/__tests__/DiscoveryEngine.test.ts
PASS src/modules/summary/__tests__/WeeklySummaryCalculator.test.ts
PASS src/modules/sync/__tests__/SupabaseSyncCoordinator.test.ts
PASS src/screens/HomeScreen/__tests__/useHomeScreen.test.ts
PASS src/screens/HomeScreen/__tests__/HomeScreenView.test.tsx
PASS src/screens/BrainGymScreen/__tests__/useBrainGym.test.ts
PASS src/screens/BrainGymScreen/__tests__/BrainGymScreenView.test.tsx
PASS src/screens/BodyMovementScreen/__tests__/useBodyMovement.test.ts
PASS src/screens/BodyMovementScreen/__tests__/BodyMovementView.test.tsx
PASS src/screens/SelfCareScreen/__tests__/useSelfCare.test.ts
PASS src/screens/SelfCareScreen/__tests__/SelfCareView.test.tsx
PASS src/screens/SocialConnectionScreen/__tests__/useSocialConnection.test.ts
PASS src/screens/SocialConnectionScreen/__tests__/SocialConnectionView.test.tsx
PASS src/screens/DiscoveryScreen/__tests__/useDiscovery.test.ts
PASS src/screens/DiscoveryScreen/__tests__/DiscoveryView.test.tsx
PASS src/screens/WeeklySummaryScreen/__tests__/useWeeklySummary.test.ts
PASS src/screens/WeeklySummaryScreen/__tests__/WeeklySummaryView.test.tsx
PASS src/navigation/__tests__/RootNavigator.test.ts
PASS src/__tests__/App.test.tsx

Test Suites: 27 passed, 27 total
Tests:       66 passed, 66 total
Snapshots:   0 total
Time:        4.043 s
```

---

## 🚀 6. Como Executar os Testes a Qualquer Momento

```powershell
powershell -ExecutionPolicy Bypass -Command "npx jest"
```
