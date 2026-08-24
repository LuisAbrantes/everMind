# Harness: Implementação de Telas React Native

> **Objetivo:** Padronizar o processo de criação e refatoração das 7 telas fundamentais do everMind em React Native + TypeScript com arquitetura em camadas e acessibilidade sênior.

---

## 🧭 Passo 1: Leitura Prévia de Contexto

Antes de iniciar a implementação da tela:
1. Ler o documento de especificação da tela correspondente em `docs/features/` (ex.: `docs/features/screen-01-home.md`).
2. Consultar `docs/DECISIONS.md` (especialmente ADR-0001, ADR-0002 e ADR-0005).
3. Adotar as personas conjuntas: `.agents/react-native-architect.md` e `.agents/senior-ux-accessibility.md`.

---

## 🏗️ Passo 2: Estrutura Canônica de Arquivos da Tela

Toda tela deve ser organizada em um módulo fechado (*Deep Module*) sob `src/screens/<NomeDaTela>/`:

```
src/screens/<NomeDaTela>/
├── index.tsx                 # Ponto de entrada exportando o Container da tela
├── <NomeDaTela>View.tsx      # Componente de apresentação puro (Dumb Component)
├── use<NomeDaTela>.ts        # Hook personalizado de orquestração de estado e efeitos
├── components/               # Subcomponentes atômicos e cartões da tela
│   └── <SubComponente>.tsx
└── __tests__/
    ├── <NomeDaTela>View.test.tsx  # Testes de renderização e acessibilidade
    └── use<NomeDaTela>.test.ts    # Testes unitários do hook e regras de apresentação
```

---

## 🧩 Passo 3: Diretrizes de Implementação

### 1. Separação Estrita de Responsabilidades (Seam Limpo)
- `<NomeDaTela>View.tsx`: Recebe apenas props com dados formatados e callbacks de ação (`onPressChallenge`, `onConfirmWater`, etc.). Não deve chamar MMKV ou APIs nativas diretamente.
- `use<NomeDaTela>.ts`: Conecta os casos de uso de domínio aos gateways de persistência (`IStorageGateway`) e feedback multissensorial (`IFeedbackService`).

### 2. Acessibilidade Sênior Obrigatória
- Todo texto renderizado deve usar o componente base `<AccessibleText>` com tamanho mínimo de `18sp`.
- Todo botão deve usar `<AccessibleButton>` com altura mínima de `48dp` (ou `56dp` para ações de destaque).
- Declarar `accessible={true}`, `accessibilityRole` e `accessibilityLabel` claro e descritivo em todos os pontos de interação.

### 3. Tratamento de Estado Offline e Feedback
- A tela deve carregar instantaneamente a partir do cache local em MMKV.
- Cada conclusão de atividade deve acionar `IFeedbackService.triggerSuccessFeedback()`.

---

## 📋 Passo 4: Critérios de Aceite e Verificação

- [ ] A tela compila sem qualquer erro de TypeScript (`strict: true`).
- [ ] O contraste visual em todos os elementos atende à proporção $\ge 7:1$.
- [ ] A navegação de retorno à tela inicial é clara e direta.
- [ ] Testes unitários cobrem todos os estados de UI (vazio, carregado, ação concluída).
