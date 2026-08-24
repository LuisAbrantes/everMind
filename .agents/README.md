# .agents/ — Framework de Personas Especializadas do everMind

Este diretório contém a definição canônica das **Personas de Engenharia e Design Especializadas** do projeto **everMind**. O framework é 100% universal e agnóstico a plataformas de IA (compatível com Claude, GPT, Gemini, Cursor, Copilot, Codex, etc.).

---

## 🧭 Ordem de Leitura Obrigatória de Sessão

Antes de qualquer persona ou assistente de IA propor alterações de código, arquitetura ou regras de negócio, o seguinte protocolo determinístico deve ser executado:

1. 📖 Ler [`docs/START_HERE.md`](../docs/START_HERE.md) — Visão geral e mapa de navegação.
2. 📖 Ler [`docs/CURRENT_STATE.md`](../docs/CURRENT_STATE.md) — Estado atual de desenvolvimento e módulos prontos.
3. 📖 Ler [`docs/DECISIONS.md`](../docs/DECISIONS.md) — Decisões arquiteturais inegociáveis (ADRs).
4. 🎯 Adotar a Persona Especializada correspondente abaixo.
5. ⚙️ Executar o Harness específico localizado em [`.agents/harnesses/`](./harnesses/).

---

## 👥 Matriz de Personas Especializadas

| Arquivo de Persona | Especialidade Principal | Escopo de Atuação no everMind |
| :--- | :--- | :--- |
| [`react-native-architect.md`](./react-native-architect.md) | Arquitetura Mobile & TypeScript | Deep modules, seams, persistência offline MMKV, separação limpa de camadas e performance. |
| [`cognitive-games-engineer.md`](./cognitive-games-engineer.md) | Jogos Cognitivos & Neurociência | Lógica dos 5 mini-jogos da Tela 2 (Memória, Sequência, Palavras, Atenção, Música) sem pressão de tempo. |
| [`gamification-rewards-engineer.md`](./gamification-rewards-engineer.md) | Gamificação Acolhedora | Máquina de estados do Cérebro Virtual (Baby $\rightarrow$ Mega Brain), Streaks Anti-Culpa (*Gentle Fallback*) e Badges. |
| [`senior-ux-accessibility.md`](./senior-ux-accessibility.md) | UX Sênior & Acessibilidade | Conformidade WCAG AAA, tipografia grande ($\ge 18\text{sp}$), áreas de toque $\ge 48\text{dp}$, feedback sonoro/háptico e tom acolhedor. |
| [`content-curator.md`](./content-curator.md) | Curadoria de Conteúdo & Hobbies | Curadoria dos desafios do botão `[ SURPREENDER-ME ]` da Tela 6 e mensagens afirmativas da Tela 7. |

---

## 🛠️ Como Utilizar este Framework

### Para Desenvolvedores Humanos:
Use estas personas e harnesses como checklists técnicos e diretrizes de revisão de Pull Requests (PRs).

### Para Modelos e Assistentes de IA:
No início de uma tarefa, declare explicitamente no chat qual persona está sendo assumida e confirme a conformidade com as regras inegociáveis do everMind antes de gerar código.
