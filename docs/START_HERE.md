# START_HERE.md — Visão Geral do everMind (1 Página)

> **everMind** é um aplicativo mobile focado em **longevidade cognitiva, hábitos ativos e bem-estar sênior**, estruturado em **4 Pilares de Vida**, **7 Telas Essenciais** e um motor de **Gamificação Acolhedora** (*Zero-Guilt / Anti-Culpa*).

---

## 🧭 Mapa de Navegação Rápida da Documentação

| Documento | Propósito | Quando Consultar |
| :--- | :--- | :--- |
| [`CONTEXT.md`](../CONTEXT.md) | Glossário e Linguagem Ubíqua pura do domínio. | Sempre que houver dúvida conceitual sobre termos e regras de negócio. |
| [`docs/CURRENT_STATE.md`](./CURRENT_STATE.md) | Estado da implementação técnica e prontidão dos módulos. | No início de cada sessão de desenvolvimento. |
| [`docs/SUPABASE_HANDOFF.md`](./SUPABASE_HANDOFF.md) | Modelo de banco por usuário, mapeamento do `localStorage`, protocolo de sync e passo a passo para conectar o Supabase. | Antes de conectar o Supabase ou mexer em `supabase/`. |
| [`docs/DECISIONS.md`](./DECISIONS.md) | Registro Arquitetural de Decisões (ADRs). | Antes de alterar arquitetura, storage, UI ou regras de gamificação. |
| [`docs/BACKLOG.md`](./BACKLOG.md) | Épicos e Histórias de Usuário priorizadas. | Para selecionar a próxima tarefa técnica a ser executada. |
| [`docs/features/`](./features/) | Especificações detalhadas das 7 telas e subsistemas. | Ao implementar ou testar uma tela ou subsistema específico. |
| [`.agents/`](../.agents/) | Personas de engenharia especializadas e Harnesses agnósticos. | Para orientar assistentes de IA e desenvolvedores em tarefas específicas. |

---

## 🌿 Os 4 Pilares da Longevidade Saudável

```
                     ┌─────────────────────────────┐
                     │          everMind           │
                     └──────────────┬──────────────┘
            ┌───────────────┬───────┴───────┬───────────────┐
            ▼               ▼               ▼               ▼
      ┌───────────┐   ┌───────────┐   ┌───────────┐   ┌───────────┐
      │   MENTE   │   │ MOVIMENTO │   │AUTOCUIDADO│   │  CONEXÃO  │
      │ Cognição  │   │ Caminhada │   │  Água,    │   │ Família,  │
      │ 5 Jogos   │   │  10 min   │   │Fruta, Sono│   │  Afeto    │
      └───────────┘   └───────────┘   └───────────┘   └───────────┘
```

1. **Mente (Cognição):** 5 micro-jogos para memória, raciocínio, vocabulário, atenção visual e música.
2. **Movimento (Corpo Ativo):** Caminhadas de 10 minutos (ao ar livre, quintal ou em casa).
3. **Autocuidado (Saúde Diária):** Hidratação (*Hora da Água*), fruta/vegetal e rotina de sono (*Boa Noite*).
4. **Conexão (Afeto Social):** Telefonar para amigos/familiares e perguntar *"Como foi seu dia?"*.

---

## 📱 As 7 Telas do Aplicativo

1. **Tela 1 — Inicial / Bom Dia:** Saudação acolhedora, exibição da **Tríade do Dia** (3 desafios equilibrados) e status do Cérebro Virtual.
2. **Tela 2 — Ginástica Cerebral:** Central com 5 mini-jogos (Memória com 5 imagens, Sequência $2 \rightarrow 4 \rightarrow 6 \rightarrow ?$, Palavras, Diferenças visuais e Canção).
3. **Tela 3 — Mexa o Corpo:** Desafio de caminhada de 10 minutos com celebração ao concluir.
4. **Tela 4 — Cuide de Você:** Check-ins simples de fruta/vegetal, água e horário regular de sono.
5. **Tela 5 — Desafio da Conexão:** Prompt empático para ligar para pessoas queridas com lembretes inteligentes.
6. **Tela 6 — Descubra Algo Novo:** 7 categorias de hobbies com o botão interativo **`[ SURPREENDER-ME ]`**.
7. **Tela 7 — Minha Semana:** Painel semanal afirmativo consolidando as conquistas dos 4 pilares sem apontar faltas.

---

## 🏆 Gamificação Acolhedora (*Zero-Guilt Streaks*)

- **Evolução do Cérebro Virtual:** 
  $$\text{Brain Baby (1-5)} \longrightarrow \text{Brain Kid (6-20)} \longrightarrow \text{Brain Teen (21-50)} \longrightarrow \text{Mega Brain (50+)}$$
  *(O progresso é permanente e nunca regride).*
- **Streaks Sem Culpa (Gentle Fallback):**
  - ❌ **Proibido:** *"Você perdeu sua sequência de 6 dias!"*
  - ✅ **Obrigatório:** *"🌱 Tudo bem! Hoje é uma nova oportunidade para cuidar de você."*
- **Badges Oficiais:** *Primeiros Passos* (5 tarefas), *Semana Ativa* (7 dias), *Mente em Movimento* (30 mentais), *Amigo Presente* (10 conexões), *Caminhante* (20 caminhadas).

---

## 🛠️ Stack Tecnológica & Princípios de Engenharia

- **Plataforma:** React Native + TypeScript (com suporte completo a iOS e Android).
- **Armazenamento:** Offline-First nativo (MMKV de alta velocidade com fallback para AsyncStorage).
- **Acessibilidade:** Diretrizes WCAG AAA para público sênior (textos $\ge 18\text{px}$, áreas de clique $\ge 48\times 48\text{dp}$, contraste $\ge 7:1$, áudios claros e haptics agradáveis).
- **Framework de Agentes:** 100% agnóstico a ferramentas proprietárias de IA via pastas `.agents/` e `.agents/harnesses/`.
