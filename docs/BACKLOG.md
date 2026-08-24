# BACKLOG.md — Backlog Priorizado do everMind

Este documento detalha o backlog técnico e funcional do projeto **everMind**, estruturado em Épicos, Sprints de desenvolvimento e Histórias de Usuário (*User Stories*) com critérios rigorosos de aceitação.

---

## 🎯 Visão Geral dos Épicos

```
┌────────────────────────────────────────────────────────────────────────┐
│ EP-01: Fundação de Domínio & Storage Offline-First (MMKV)              │
├────────────────────────────────────────────────────────────────────────┤
│ EP-02: Motor de Gamificação Acolhedora & Cérebro Virtual (Zero-Guilt)   │
├────────────────────────────────────────────────────────────────────────┤
│ EP-03: Design System Sênior & Camada de Acessibilidade (WCAG AAA)      │
├────────────────────────────────────────────────────────────────────────┤
│ EP-04: Tela 1 — Home / Bom Dia & Tríade do Dia                         │
├────────────────────────────────────────────────────────────────────────┤
│ EP-05: Tela 2 — Ginástica para o Cérebro (5 Mini-Jogos Cognitivos)     │
├────────────────────────────────────────────────────────────────────────┤
│ EP-06: Telas 3, 4 e 5 — Movimento, Autocuidado & Conexão Social        │
├────────────────────────────────────────────────────────────────────────┤
│ EP-07: Telas 6 e 7 — Descoberta Surpresa & Minha Semana (Retrospectiva)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 ÉPICO 1: Fundação de Domínio & Storage Offline-First (MMKV)

### US-101: Estruturação das Entidades de Domínio e Tipos TypeScript
- **Como** arquiteto do sistema,
- **Quero** definir as interfaces, tipos e entidades puras do domínio (`PillarType`, `Challenge`, `DailyTriad`, `BrainState`, `Badge`, `WeeklyStats`),
- **Para que** todas as camadas de aplicação e UI compartilhem uma linguagem ubíqua estrita e livre de ambiguidades.
- **Critérios de Aceitação:**
  1. Tipos 100% aderentes ao [`CONTEXT.md`](../CONTEXT.md).
  2. Imutabilidade em estruturas de valor (*Value Objects*).
  3. Zero dependência de bibliotecas de terceiros na camada de domínio puro.

### US-102: Implementação do Seam de Persistência `IStorageGateway`
- **Como** engenheiro de software,
- **Quero** criar a interface `IStorageGateway` e as implementações `MMKVStorageAdapter` e `InMemoryStorageAdapter`,
- **Para que** o aplicativo funcione de forma ultra-rápida offline e possua testes unitários sem acoplamento a hardware.
- **Critérios de Aceitação:**
  1. Leitura e escrita síncrona com tratamento resiliente de erros e corrupção de dados.
  2. Suporte a serialização tipada segura de datas e estados de progresso.
  3. Cobertura de testes unitários $\ge 95\%$ no `InMemoryStorageAdapter`.

---

## 🧠 ÉPICO 2: Motor de Gamificação Acolhedora & Cérebro Virtual

### US-201: Máquina de Estados de Evolução do Cérebro Virtual
- **Como** usuário do everMind,
- **Quero** ver meu Cérebro Virtual evoluir de estágio conforme concluo meus desafios (`Brain Baby` $\rightarrow$ `Brain Kid` $\rightarrow$ `Brain Teen` $\rightarrow$ `Mega Brain`),
- **Para que** eu sinta meu progresso cognitivo crescendo de forma tangível e definitiva.
- **Critérios de Aceitação:**
  1. Faixas de transição exatas: Baby (1 a 5), Kid (6 a 20), Teen (21 a 50), Mega Brain (51+).
  2. O cérebro **nunca regride de nível**, mesmo após longos períodos de inatividade.
  3. Disparo de evento de celebração na primeira transição para cada novo estágio.

### US-202: Motor de Streaks Acolhedores e Mecânica de Gentle Fallback
- **Como** usuário sênior,
- **Quero** ser reconhecido pela minha constância diária sem ser punido se eu esquecer ou não puder acessar o app por algum dia,
- **Para que** eu nunca sinta frustração, ansiedade ou culpa.
- **Critérios de Aceitação:**
  1. Proibição absoluta de mensagens de perda de sequência no código.
  2. Em caso de retorno após dias inativos, exibir saudação positiva de acolhimento (*"🌱 Tudo bem! Hoje é uma nova oportunidade para cuidar de você."*).
  3. Preservação da contagem cumulativa de hábitos concluídos.

### US-203: Sistema de Avaliação de Conquistas (Badges)
- **Como** usuário,
- **Quero** desbloquear emblemas especiais de reconhecimento,
- **Para que** eu celebre marcos significativos de dedicação à minha saúde e mente.
- **Critérios de Aceitação:**
  1. Desbloqueio automático das 5 badges oficiais: *Primeiros Passos* (5 desafios), *Semana Ativa* (7 dias), *Mente em Movimento* (30 mentais), *Amigo Presente* (10 conexões), *Caminhante* (20 caminhadas).
  2. Persistência da data e hora da conquista de cada badge.

---

## 🎨 ÉPICO 3: Design System Sênior & Acessibilidade WCAG AAA

### US-301: Componentes Atômicos Acessíveis para Público Sênior
- **Como** usuário sênior com possíveis dificuldades motoras ou visuais,
- **Quero** interagir com botões grandes, textos nítidos e elementos de alto contraste,
- **Para que** o manuseio do aplicativo seja agradável, intuitivo e sem esforço visual.
- **Critérios de Aceitação:**
  1. Todas as áreas clicáveis possuem tamanho mínimo de $48 \times 48\text{dp}$ (botões principais com altura de $56\text{dp}$).
  2. Tamanho mínimo de fonte para leitura regular de $18\text{sp}$ com suporte ao escalonamento de fontes do sistema operacional.
  3. Contraste cromático mínimo de $7:1$ entre texto e fundo.

### US-302: Seam de Feedback Multissensorial (Áudio e Haptics)
- **Como** usuário,
- **Quero** receber confirmações sonoras suaves e vibrações hápticas leves ao concluir atividades,
- **Para que** eu tenha confirmação multissensorial clara do meu progresso.
- **Critérios de Aceitação:**
  1. Interface `IFeedbackService` isolando efeitos nativos.
  2. Sons harmoniosos, sem ruídos agudos ou estridentes.
  3. Configuração de acessibilidade para desativar som ou vibração caso o usuário prefira.

---

## ☀️ ÉPICO 4: Tela 1 — Home / Bom Dia & Tríade do Dia

### US-401: Gerador e Coordenador da Tríade Diária
- **Como** usuário,
- **Quero** abrir o aplicativo e ver exatamente 3 desafios diários selecionados a partir dos 4 pilares,
- **Para que** eu saiba exatamente o que fazer no dia sem me sentir sobrecarregado.
- **Critérios de Aceitação:**
  1. A Tríade Diária sorteia 3 atividades de pilares distintos (ex.: 1 Mente + 1 Movimento + 1 Autocuidado/Conexão).
  2. A Tríade permanece fixada ao longo do mesmo dia (determinismo temporal).
  3. Atualização dinâmica dos cards à medida que os desafios são concluídos.

### US-402: Card do Cérebro Virtual na Home
- **Como** usuário,
- **Quero** visualizar meu avatar do Cérebro Virtual na tela inicial com seu nível atual e barra de carinho/progresso,
- **Para que** eu acompanhe meu crescimento com uma rápida olhada.
- **Critérios de Aceitação:**
  1. Ilustração/ícone animado correspondente ao estágio atual (`Brain Baby`, `Kid`, `Teen`, `Mega Brain`).
  2. Frase motivacional e acolhedora contextualizada ao período do dia (manhã, tarde, noite).

---

## 🧩 ÉPICO 5: Tela 2 — Ginástica para o Cérebro (5 Mini-Jogos)

### US-501: Mini-Jogo de Memória Visual (5 Imagens)
- **Como** usuário,
- **Quero** memorizar uma sequência de 5 imagens temáticas e identificá-las após breve intervalo,
- **Para que** eu exercite minha memória de trabalho e retenção visual.
- **Critérios de Aceitação:**
  1. Ícones e ilustrações grandes e com nomes legíveis abaixo.
  2. Sem temporizador punitivo que feche a tela com "Game Over".
  3. Feedback festivo ao acertar o conjunto.

### US-502: Mini-Jogo de Sequência Lógica ($2 \rightarrow 4 \rightarrow 6 \rightarrow ?$)
- **Como** usuário,
- **Quero** completar sequências numéricas e de padrões simples escolhendo entre opções grandes,
- **Para que** eu estimule meu raciocínio lógico e cálculo mental de baixa fricção.
- **Critérios de Aceitação:**
  1. Sequências graduais e intuitivas (progressões aritméticas simples, padrões visuais).
  2. Teclado/botões com opções claras de resposta.

### US-503: Mini-Jogos de Palavras, Atenção Visual e Canção
- **Como** usuário,
- **Quero** jogar desafios de vocabulário (palavras com letra X), discriminação visual (encontrar o objeto diferente) e reconhecimento de canções nostálgicas,
- **Para que** eu varie os estímulos mentais com diversão e memória afetiva.
- **Critérios de Aceitação:**
  1. Vocabulário adaptado ao português brasileiro sem jargões complexos.
  2. Cenários visuais limpos e sem poluição gráfica.
  3. Trechos musicais agradáveis com opções de títulos conhecidos.

---

## 🏃 ÉPICO 6: Telas 3, 4 e 5 — Movimento, Autocuidado & Conexão

### US-601: Tela 3 — Mexa o Corpo (Caminhada de 10 Minutos)
- **Como** usuário,
- **Quero** ser convidado a realizar uma caminhada leve de 10 minutos em qualquer ambiente (rua, quintal ou sala),
- **Para que** eu mantenha meu corpo ativo com facilidade.
- **Critérios de Aceitação:**
  1. Timer amigável opcional com opção direta de marcar `[ CONCLUÍDO ]`.
  2. Mensagem calorosa de parabenização e soma ao pilar Movimento.

### US-602: Tela 4 — Cuide de Você (Fruta/Vegetal, Água e Sono)
- **Como** usuário,
- **Quero** registrar rapidamente meu momento de água, refeição colorida e ritual de sono,
- **Para que** eu cuide da minha hidratação, nutrição e descanso.
- **Critérios de Aceitação:**
  1. Botões de um toque: *"Tomou água hoje? [ SIM ]"*, *"Adicionou uma fruta ou vegetal? [ SIM ]"*.
  2. Reforço visual imediato com ícones de saúde e vitalidade.

### US-603: Tela 5 — Desafio da Conexão (Afeto e Diálogo)
- **Como** usuário,
- **Quero** receber lembretes carinhosos para ligar para um amigo ou parente e conversar,
- **Para que** eu fortaleça meus laços afetivos e evite o isolamento social.
- **Critérios de Aceitação:**
  1. Sugestões de perguntas empáticas (*"Como foi o seu dia?", "O que você fez de bom hoje?"*).
  2. Ações: `[ EU VOU LIGAR ]` e `[ LEMBRAR MAIS TARDE ]` sem penalidade.

---

## 🎲 ÉPICO 7: Telas 6 e 7 — Descoberta Surpresa & Minha Semana

### US-701: Tela 6 — Descubra Algo Novo & Botão `[ SURPREENDER-ME ]`
- **Como** usuário curioso,
- **Quero** girar a roleta de surpresas ou escolher entre 7 categorias para aprender algo novo ou praticar um hobby,
- **Para que** eu desenvolva minha neuroplasticidade e me divirta com novas atividades.
- **Critérios de Aceitação:**
  1. Banco de atividades nas 7 categorias (Música, Leitura, Desenho, Jardinagem, Receita, Palavra Nova, Fotografia).
  2. Botão `[ SURPREENDER-ME ]` com animação leve de revelação e opção de marcar como concluído.

### US-702: Tela 7 — Minha Semana (Consolidação Semanal Afirmativa)
- **Como** usuário,
- **Quero** abrir meu painel semanal e ver a soma de tudo o que realizei nos 4 pilares,
- **Para que** eu sinta orgulho da minha jornada e veja meu progresso consolidado.
- **Critérios de Aceitação:**
  1. Contadores afirmativos destacados por pilar (Mente, Movimento, Autocuidado, Conexão).
  2. Mensagem motivacional de fechamento de ciclo (*"Parabéns! Você está construindo bons hábitos no seu próprio ritmo!"*).
  3. Zero exibição de lacunas negativas ou comparações estressantes.
