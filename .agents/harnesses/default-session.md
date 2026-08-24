# Harness: Onboarding de Sessão de Desenvolvimento (Default Session)

> **Objetivo:** Estabelecer o protocolo determinístico e agnóstico de inicialização de qualquer sessão de trabalho com IA ou engenheiros humanos no repositório **everMind**.

---

## 🧭 Passo 1: Contexto e Ordem de Leitura Obrigatória

Antes de responder qualquer pergunta técnica, propor código ou modificar arquivos, você DEVE ler e processar os seguintes arquivos na ordem:

1. `CONTEXT.md` — Glossário Canônico e Linguagem Ubíqua do everMind.
2. `docs/START_HERE.md` — Visão geral e mapa de navegação.
3. `docs/CURRENT_STATE.md` — Estado atual dos módulos e tarefas pendentes.
4. `docs/DECISIONS.md` — Registro de Decisões Arquiteturais (ADRs).

---

## 📋 Passo 2: Checklist da Primeira Resposta

Ao ser acionado para iniciar uma tarefa, responda ao usuário estruturando seu output nos seguintes pontos obrigatórios:

1. **Estado Atual dos Módulos:** Resumo conciso de quais partes do app já estão documentadas ou implementadas.
2. **Pilar(es) Impactado(s):** Indicar explicitamente quais dos 4 pilares (*Mente, Movimento, Autocuidado, Conexão*) serão afetados pela tarefa proposta.
3. **Persona Assumida:** Declarar qual persona de `.agents/` está sendo utilizada para conduzir a tarefa.
4. **Regras Inegociáveis Ativas:** Confirmar a conformidade com:
   - *Gentle Fallback* (Zero mensagens de culpa ou perda de streak).
   - Acessibilidade Sênior (WCAG AAA, fontes $\ge 18\text{sp}$, botões $\ge 48\times 48\text{dp}$).
   - Offline-First (persiste localmente em MMKV sem requisições externas obrigatórias).
5. **Plano de Execução Proposto:** Passos numerados da implementação antes de alterar o código.

---

## 🚫 Restrições de Execução

- NÃO gere código ou modifique arquivos até que o escopo e o plano tenham sido alinhados.
- NÃO utilize APIs proprietárias de assistentes de IA específicas; mantenha toda documentação e código em TypeScript puro e React Native universal.
