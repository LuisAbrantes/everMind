# Feature Spec: Tela 07 — Minha Semana (Retrospectiva & Reforço Positivo)

> **Identificador:** `screen-07-weekly-summary`  
> **Pilar Central:** Consolidação dos 4 Pilares (Mente, Movimento, Autocuidado, Conexão)  
> **Objetivo Cognitivo-Comportamental:** Celebrar as conquistas da semana com psicologia afirmativa, reforçando o autoelogio, a autoeficácia e a constância prazerosa no próprio ritmo.

---

## 🌟 1. Anatomia Visual e Componentes da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ 🌟 Minha Semana                              [ 🏠 Início ]  │
│ Veja tudo de bom que você realizou nos últimos 7 dias:      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🧠 4 ATIVIDADES MENTAIS                                 │ │
│ │ Jogos de memória, sequência e raciocínio concluídos     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚶 3 CAMINHADAS & MOVIMENTO                             │ │
│ │ Momentos dedicados a movimentar o corpo e respirar bem  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌿 5 MOMENTOS DE AUTOCUIDADO                            │ │
│ │ Hidratação com água fresca e alimentação nutritiva      │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ❤️ 2 CONTATOS DE AFETO                                  │ │
│ │ Ligações carinhosas e conversas com amigos e família    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎉 "Parabéns! Você está construindo hábitos maravilhosos│ │
│ │ no seu próprio ritmo e com muito carinho por você!"     │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│          [ 📤 COMPARTILHAR MINHAS CONQUISTAS ]             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Modelo de Dados e Agregação Semanal

```typescript
export interface IWeeklySummaryReport {
  weekStartDate: string; // Ex: "2026-08-11"
  weekEndDate: string;   // Ex: "2026-08-18"
  mindPillarTotal: number;
  movementPillarTotal: number;
  selfCarePillarTotal: number;
  connectionPillarTotal: number;
  totalActivitiesCompleted: number;
  affirmativeMessage: string;
  isPerfectActiveWeek: boolean; // Dispara Badge "Semana Ativa"
}
```

---

## 🛡️ 3. Regras de Psicologia Positiva (Zero Culpa)

1. **Exibição Estritamente Afirmativa:**
   - **TERMINANTEMENTE PROIBIDO:** Exibir calendários com cruzes vermelhas em dias não preenchidos ou gráficos que destaquem metas incompletas (ex.: *"Faltaram 2 caminhadas"*).
   - Qualquer número maior que zero é celebrado como uma vitória legítima.
2. **Mensagem Adaptativa de Reforço:**
   - Se o usuário fez 1 atividade: *"Que ótimo! Você deu o primeiro passo essa semana. Cada pequeno momento conta!"*
   - Se o usuário fez 10+ atividades: *"Sensacional! Sua semana foi repleta de vitalidade e carinho pela sua mente e corpo!"*

---

## ♿ 4. Acessibilidade Sênior (WCAG AAA)

- **Cards com Borda Colorida por Pilar:**
  - Azul Ciano (`#38BDF8`) para Mente.
  - Âmbar/Laranja (`#F59E0B`) para Movimento.
  - Verde Esmeralda (`#10B981`) para Autocuidado.
  - Rosa Coral (`#F43F5E`) para Conexão.
- **Botão de Compartilhar Acessível:** Permite gerar uma imagem bonita ou mensagem de texto simples para enviar via WhatsApp para filhos, netos ou amigos.

---

## 🧪 5. Critérios de Aceitação

- [ ] A agregação semanal calcula com precisão a janela dos últimos 7 dias a partir do histórico local em MMKV.
- [ ] O relatório carrega instantaneamente sem travar a interface.
- [ ] Testes unitários cobrem semanas com 1, 5 e 20+ atividades garantindo mensagens sempre positivas.
