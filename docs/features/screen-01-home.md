# Feature Spec: Tela 01 — Inicial / Bom Dia (Home & Tríade Diária)

> **Identificador:** `screen-01-home`  
> **Pilar Central:** Orquestração dos 4 Pilares (Mente, Movimento, Autocuidado, Conexão)  
> **Objetivo Cognitivo:** Proporcionar acolhimento diário, clareza de propósito com baixa sobrecarga mental e visão imediata do progresso do Cérebro Virtual.

---

## 📱 1. Anatomia Visual e Componentes da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ ☀️ Bom dia, Maria!                       [⚙️ Configurações]│
│ "Hoje é um lindo dia para cuidar de você!"                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🧠 MEU CÉREBRO VIRTUAL                  Estágio: KID    │ │
│ │ [🌱 Avatar Animado]    Progresso: 14/20 desafios        │ │
│ │ ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 📋 TRÍADE DO DIA (3 Atividades Recomendadas)                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🧠 1. MENTE: Jogo de Sequência Numérica                 │ │
│ │    Exercite seu raciocínio rápido       [ JOGAR AGORA ] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚶 2. MOVIMENTO: Caminhada de 10 minutos                │ │
│ │    Dê uma volta relaxante no quintal    [ INICIAR ]     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💧 3. AUTOCUIDADO: Hora da Água                         │ │
│ │    Já bebeu um copo d'água agora?       [ JÁ BEBI ✓ ]   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [ 🎲 SURPREENDER-ME COM UM HOBBY ]                          │
├─────────────────────────────────────────────────────────────┤
│ 🌟 "Você já completou 2 de 3 desafios hoje! Parabéns!"      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Modelo de Dados e Tipos TypeScript

```typescript
export interface IDailyChallengeSummary {
  id: string;
  pillar: 'MIND' | 'MOVEMENT' | 'SELFCARE' | 'CONNECTION';
  title: string;
  subtitle: string;
  route: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface IHomeScreenState {
  greeting: string;
  dateFormatted: string;
  brainStage: 'BABY' | 'KID' | 'TEEN' | 'MEGA';
  totalCompletedChallenges: number;
  currentStageProgress: number; // Ex: 14
  currentStageTarget: number;   // Ex: 20
  streakMessage: string;
  triadChallenges: [IDailyChallengeSummary, IDailyChallengeSummary, IDailyChallengeSummary];
}
```

---

## 🔄 3. Fluxo de Interação e Estados da Tela

1. **Abertura do Aplicativo:**
   - O hook `useHomeScreen` lê o estado em MMKV instantaneamente.
   - A saudação varia conforme o horário:
     - 05:00 - 11:59: *"☀️ Bom dia!"*
     - 12:00 - 17:59: *"🌤️ Boa tarde!"*
     - 18:00 - 04:59: *"🌙 Boa noite!"*
2. **Interação com a Tríade Diária:**
   - O toque em qualquer um dos cards navega suavemente para a respectiva tela (Telas 2, 3, 4 ou 5).
   - Ao retornar de uma atividade concluída, o card correspondente exibe uma marcação verde com ícone `✓` e o Cérebro Virtual atualiza sua barra com animação fluida.
3. **Conclusão da Tríade (3 de 3):**
   - Disparo de confetes na tela, som harmonioso e mensagem: *"🎉 Incrível! Você completou sua Tríade do Dia! Seu cérebro está mais forte!"*.

---

## ♿ 4. Diretrizes de Acessibilidade Sênior (WCAG AAA)

- **Contraste:** Fundo escuro profundo (`#07090E`) com cards em azul-marinho escuro (`#0F172A`) e textos em branco puro (`#F8FAFC`), garantindo contraste $\ge 10:1$.
- **Áreas de Toque:** Cada card da Tríade possui altura mínima de `72dp` e botões de ação com altura de `56dp`.
- **Acessibilidade Nativa:** Leitor de tela lê: *"Desafio 1 de 3: Mente. Jogo de Sequência Numérica. Toque duas vezes para jogar."*

---

## 🧪 5. Critérios de Teste e Aceitação

- [ ] A Tríade sorteada contém sempre 3 desafios equilibrados e não muda no mesmo dia de calendário.
- [ ] A evolução da barra do Cérebro Virtual reflete exatamente o estado persistido localmente.
- [ ] Teste unitário garante que nenhum texto culposo é exibido mesmo se o usuário tiver ficado semanas sem abrir o app.
