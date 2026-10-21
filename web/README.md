# everMind Web — portagem do React Native para HTML/CSS/JS puro

> **Status:** ✅ funcional e verificado · **Escopo:** portagem 1:1 das 7 telas + 5 minijogos originais + 4 minijogos novos (Pares, Complete o Ditado, Conta do Mercado, Ordem Certa) · **Alvo:** PWA mobile-first

Este diretório é uma **cópia independente** do aplicativo everMind, escrito em
HTML, CSS e JavaScript puros — **sem React, sem TypeScript, sem build, sem
`node_modules`**. O projeto React Native original permanece intacto ao lado,
em `../src`, para comparação.

---

## 1. Como executar

### Opção A — abrir direto (duplo clique)

Dê duplo clique em `index.html`. Funciona em `file://` porque todos os scripts
são `<script>` clássicos (nada de módulos ES, que o navegador bloqueia em
`file://` por CORS).

> ⚠️ Em `file://` **não** há modo offline: o service worker exige `http(s)`.
> O app funciona normalmente, apenas não é instalável.

### Opção B — servir por HTTP (recomendado, libera a PWA)

```bash
cd evermind-web

# qualquer um destes:
npx serve .
python -m http.server 8080
php -S localhost:8080
```

Depois abra `http://localhost:8080`.

### Opção C — instalar como aplicativo

Com o servidor ativo, no Chrome/Edge (Android ou desktop) ou Safari (iOS):

- **Chrome/Edge:** botão de instalar na barra de endereço, ou menu ⋮ → *Instalar app*.
- **iOS/Safari:** Compartilhar → *Adicionar à Tela de Início*.

A instalação exige `http://localhost` **ou** HTTPS. `localhost` já é tratado
como contexto seguro.

---

## 2. Estrutura de arquivos

```
evermind-web/
├── index.html                  # shell do app + <script> em ordem de dependência
├── manifest.webmanifest        # metadados da PWA (nome, ícone, display, cores)
├── sw.js                       # service worker: cache-first do app shell
├── css/
│   ├── tokens.css              # variáveis de design + reset enxuto
│   ├── components.css          # portagem de src/ui/components + shell do app
│   ├── utilities.css           # camada utilitária (Tailwind → CSS puro)
│   └── screens.css             # ajustes específicos por tela
├── js/
│   ├── core/
│   │   ├── dom.js              # h() / view() / row() — substitui o JSX
│   │   ├── storage.js          # IStorageGateway (localStorage + memória)
│   │   └── store.js            # store observável + rotas + toasts
│   ├── domain/                 # ← portagem de src/modules/**
│   │   ├── types.js
│   │   ├── brain-evolution-engine.js
│   │   ├── gentle-streak-manager.js
│   │   ├── badge-evaluator.js
│   │   ├── daily-triad-coordinator.js
│   │   ├── habits-coordinator.js
│   │   ├── social-coordinator.js
│   │   ├── discovery-engine.js
│   │   ├── weekly-summary-calculator.js
│   │   ├── feedback-service.js
│   │   ├── supabase-client.js
│   │   └── supabase-sync.js
│   ├── games/                  # ← portagem de src/modules/brain/** (+ 4 jogos novos)
│   │   ├── game-utils.js       # PRNG com semente + embaralhamento reproduzível (jogos novos)
│   │   ├── memory-game-engine.js
│   │   ├── sequence-game-engine.js
│   │   ├── words-game-engine.js
│   │   ├── attention-game-engine.js
│   │   ├── music-game-engine.js
│   │   ├── pairs-game-engine.js     # novo — Pares (jogo da memória, 6 pares)
│   │   ├── proverbs-game-engine.js  # novo — Complete o Ditado
│   │   ├── market-game-engine.js    # novo — Conta do Mercado (R$ em centavos)
│   │   └── order-game-engine.js     # novo — Ordem Certa (sequenciamento)
│   ├── ui/
│   │   └── components.js       # Text, Button, Card, Badge, Avatar, Progress
│   ├── screens/                # ← portagem de src/screens/**
│   │   ├── home.js
│   │   ├── brain-gym.js
│   │   ├── body-movement.js
│   │   ├── self-care.js
│   │   ├── social-connection.js
│   │   ├── discovery.js
│   │   └── weekly-summary.js
│   └── app.js                  # ← App.tsx + RootNavigator.tsx
├── icons/                      # ícones da PWA (SVG + PNG)
└── tools/
    └── make-icons.ps1           # regenera os PNG (Windows / System.Drawing)
```

### Mapa de origem → destino

| Origem (React Native) | Destino (web) |
| :--- | :--- |
| `App.tsx` | `js/app.js` (montagem do shell) |
| `src/navigation/RootNavigator.tsx` | `js/app.js` (`NAV_TABS`, `navigate`, tab bar) |
| `src/ui/components/*` | `js/ui/components.js` + `css/components.css` |
| `src/modules/domain/types.ts` | `js/domain/types.js` |
| `src/modules/gamification/*` | `js/domain/brain-evolution-engine.js`, `gentle-streak-manager.js`, `badge-evaluator.js` |
| `src/modules/daily-triad/*` | `js/domain/daily-triad-coordinator.js` |
| `src/modules/habits/*` | `js/domain/habits-coordinator.js` |
| `src/modules/social/*` | `js/domain/social-coordinator.js` |
| `src/modules/discovery/*` | `js/domain/discovery-engine.js` |
| `src/modules/summary/*` | `js/domain/weekly-summary-calculator.js` |
| `src/modules/storage/*` | `js/core/storage.js` |
| `src/modules/feedback/*` | `js/domain/feedback-service.js` |
| `src/modules/sync/*` | `js/domain/supabase-sync.js` + `supabase-client.js` |
| `src/lib/supabase.ts` | `js/domain/supabase-client.js` |
| `src/modules/brain/*` (5 engines) | `js/games/*` |
| `src/screens/*` (7 telas) | `js/screens/*` |
| `src/screens/*/useXxx.ts` | folded into the corresponding `js/screens/*.js` |

---

## 3. Decisões de arquitetura

### 3.1 Como o React foi substituído

O projeto original **não usa animações** — cada interação é uma troca
instantânea de estado seguida de re-render. A estratégia mais fiel e mais
simples é, portanto, **redesenhar a tela inteira a cada mudança de estado**,
exatamente como o React faria.

| Conceito React | Substituto |
| :--- | :--- |
| `useState` | closure de módulo em `js/screens/*.js` |
| re-render | `EM.app.render()` redesenha `#screen` |
| `useMemo` | cálculo direto dentro de `render()` |
| `useEffect` | `syncTimerInterval()` em `body-movement.js`, chamado no fim de `render()` |
| `<View>` | `view()` → `<div class="v">` (`display:flex; flex-direction:column`) |
| `<View className="flex-row">` | `row()` → `<div class="v row">` |
| `<Pressable>` | `<button type="button">` |
| `<ScrollView>` | `<div class="screen-scroll">` com `overflow-y:auto` |
| `SafeAreaView` | `env(safe-area-inset-*)` |
| `accessibilityLabel` | `aria-label` (strings **idênticas**) |
| `MMKVStorageGateway` | `LocalStorageGateway` (mesma API síncrona) |

**Dois cuidados que tornam isso seguro:**

1. O container de rolagem (`#screen`) fica **fora** da árvore redesenhada, então
   a posição do scroll nunca se perde — como o `ScrollView` do React Native.
2. O único efeito com ciclo de vida do app (o `setInterval` de 1 s do
   cronômetro) mora **fora** do caminho de construção do DOM. `render()` só o
   reavalia; a criação é sempre precedida de limpeza, então nenhum intervalo
   duplicado pode sobreviver a um redesenho.

### 3.2 Ordem das folhas de estilo — o ponto mais frágil

No NativeWind, quando duas classes conflitam **vence a última dentro da string
do `className`** (ex.: `Card` = `p-6`, e a tela passa `p-5`).

Em CSS real todas as regras de classe têm a **mesma especificidade**, então
quem vence é a **ordem no arquivo**. Por isso o `index.html` carrega nesta ordem:

```
tokens.css  →  components.css  →  utilities.css  →  screens.css
```

E `css/utilities.css` está deliberadamente ordenado para que os overrides
continuem vencendo:

| Conflito | Ordem no arquivo |
| :--- | :--- |
| padding | `.p-6` → `.p-5` → `.p-4` |
| borda | `.border` → `.border-2` |
| raio | `.rounded-3xl` → `.rounded-2xl` → `.rounded-full` |
| direção do flex | `.v` (column) → `.row` |
| tamanho de texto | ascendente: `.t-11` → … → `.t-5xl` |
| cor de texto | `.t-fg` → `.t-muted` → `.t-invert` |
| peso de fonte | `.fw-medium` → `.fw-semibold` → `.fw-bold` → `.fw-extrabold` |

> ⚠️ **Se você adicionar uma classe utilitária que conflite com outra, coloque-a
> DEPOIS no `utilities.css`.** Só assim ela vence.

### 3.2.1 Acessibilidade e navegação (outubro/2026, ADR-0010)

- **5 abas** (Hoje, Mente, Corpo, Cuidado, Mais). Afeto, Descobrir e Semana (e,
  futuramente, Ajustes) ficam em `js/screens/more.js`; `EM.MORE_ROUTES` lista
  essas rotas e `EM.tabForScreen(id)` diz qual aba fica com `aria-current`.
  Subtelas de "Mais" recebem um botão **Voltar** automático em `app.render`.
- Tokens: `--fill-*` são preenchimentos; `--border-*` (>= 3:1) são só bordas.
  Texto >= 7:1. Tamanhos em `rem`; piso de 14px (selos/abas), 16px secundário,
  18px corpo. Estados desativado/bloqueado usam cor sólida + borda tracejada
  (`.op-40/.op-50/.op-70` não alteram mais a opacidade).
- `#sr-status` (polite) anuncia toasts e trocas de tela (`EM.announce`);
  `app.render` devolve o foco ao controle ativo (use `data-focus-key` para uma
  chave estável).

### 3.3 `@container` em vez de `@media`

O `.app-root` tem `max-width: 640px`. Em um tablet, a **janela** tem 768px mas
o **app** tem 640px — uma `@media` reagiria à largura errada. Por isso o shell é
`container-type: inline-size` e os breakpoints usam `@container evermind (...)`,
com `@media` como fallback declarado antes (navegadores antigos ignoram
`@container` e usam a `@media`).

---

## 4. Fidelidade: o que foi mantido **exatamente** igual

Estes pontos são sutil e easy de quebrar numa refatoração. Todos foram validados:

### 4.1 Sorteio da Tríade do Dia (determinístico)

Hash *estilo Java* (`h*31 + c`, 32 bits com sinal) da data local `YYYY-MM-DD`,
depois extração de **3 dígitos em base 4** para escolher 3 pilares **distintos**,
e `absSeed % <tamanho do pilar>` (o **mesmo** `absSeed` nos três) para escolher
o desafio de cada pilar.

Validação de referência: `'2026-08-19'` → `seed = 1161874306` → pilares
`[SELFCARE, CONNECTION, MIND]` → desafios
`['selfcare_fruit_snack', 'connection_call_loved_one', 'mind_memory_pairs']`.

### 4.2 Cérebro Virtual nunca involui

`evaluateStage(total, previousHighest)` devolve `max(calculado, anterior)`.
Uma vez alcançado *Brain Kid*, o usuário permanece *Brain Kid*.

> ⚠️ `calculateProgress` usa o **total absoluto**, não um offset relativo ao
> estágio: Brain Kid com total 6 mostra `6 / 20` = **30%**, e não 6%. Isso parece
> errado, mas é o comportamento do original e foi mantido.

### 4.3 Política anti-culpa (*Gentle Fallback*)

- Nenhum caminho de código decrementa a sequência.
- Gap ≥ 2 dias → sequência volta a 1, **acumulado preservado**, mensagem de
  acolhimento.
- `sanitizeMessage()` troca 9 termos punitivos por `recomeço gentil`.
- ⚠️ O `RegExp` é **construído dentro do laço a cada chamada** (a flag `g` +
  `.test()` envenenariam um regex cacheado via `lastIndex`).
- Verificado: **zero** ocorrências de linguagem punitiva nas 7 telas, nos 5 jogos
  e nos estados de erro de cada jogo.

### 4.4 Pseudo-shuffle da Memória Visual

O score usa **apenas o primeiro caractere do id** (`id.charCodeAt(0) * seed) % 17`)
com o `Array#sort` **estável** do V8. Consequência preservada: `book` sempre
precede `bird` e `cup` sempre precede `clock`. **Não** substitua por um
Fisher–Yates — os alvos mudariam a cada rodada e o jogo ficaria imprevisível.

A grade é ordenada por `localeCompare` (collation ICU), não por code unit.
Verificado: `Árvore` ordena como `Arvore` (primeira), entre `A` e `B`.

### 4.5 `words` usa o comparador enviesado

`sort(() => 0.5 - Math.random())` — **não** é um Fisher–Yates uniforme. É o que
dá a sensação de sorteio e é o que o original usa. (O conjunto mostrado agora
mistura 4 palavras que servem + 4 distratores — ver §6, item 3 —, mas o embaralhamento
continua sendo este.)

### 4.6 Retorno do mesmo objeto em caminhos de "no-op"

Vários motores devolvem a **mesma referência** quando nada muda. O app original
depende disso para detectar "acabou de resolver" via
`nextState.isSolved && !prev.isSolved`. Uma cópia defensiva "prestativa"
quebraria a contagem de atividades.

### 4.7 Datas: agora só LOCAIS (era "duas convenções") — **mudou**

> Substitui a antiga nota de fidelidade (Tríade local × coordenadores UTC).

Toda data `YYYY-MM-DD` do app (tríade, hábitos, streak, resumo semanal, log de
conclusões) vem de `getFullYear/getMonth/getDate`, no fuso do aparelho.
`todayUtcDateString` (em `types.js`) é só um **alias deprecado** que devolve a
data local. Cada tela relê `EM.app.today()` a cada render, e o `app.js`
confere a virada do dia a cada minuto e ao voltar à aba — os hábitos reiniciam
à meia-noite local mesmo com o app aberto.

### 4.8 Recompensas: agora idempotentes — **mudou**

> Substitui a antiga nota "contadores não idempotentes".

Caminhada e ligação rendem **uma recompensa por dia**; a água conta como
**um** desafio quando a meta de 4 copos é atingida (cada copo aparece, mas só a
meta pontua); fruta e sono, uma vez por dia; cada descoberta, uma vez por dia
(sortear de novo o mesmo item não reabre a recompensa). Abrir um card da Tríade
**não** dá mais +1: só a atividade real conclui.

### 4.9 Pontos de crescimento

Os coordenadores somam `+10` por recompensa concedida. A Home deixou de
recalcular `total * 10` (esse caminho de "alternar conclusão" foi removido).

---

---

## 5. Correções deliberadas

As cinco primeiras são correções de portagem; a §5.6 reúne as **decisões de produto da auditoria de 2026-10** (ADR-0009), que deliberadamente abandonam peculiaridades do app original:

### 5.1 Fuso horário na Gentle Streak — `gentle-streak-manager.js`

O original fazia `new Date(lastActiveDate)`. Pela spec do ECMA-262, uma string
apenas-de-data (`"2026-09-30"`) é interpretada como **meia-noite UTC**; em
seguida o código a trunca de volta para a meia-noite **local**. No Brasil
(UTC−3) isso recua um dia, então um usuário cujo `lastActiveDate` era o dia de
hoje recebia `diffDays === 1` e via *"🔥 Que alegria! Você está há N+1 dias"*.

**Correção:** `parseLocalDate()` interpreta a string como data **local**.
Toda a lógica de ramificação, as mensagens e as constantes seguem idênticas.
Agora `lastActiveDate === hoje` → `diffDays === 0` → *"🔥 Você está firme hoje!"*.

### 5.2 Estouro horizontal de badges longas

Rótulos como `+10 PONTOS / DESCOBERTA` e `✓ RITUAL CONFIRMADO` estouravam a
largura da tela em 320–390 px. **Correção:** `.badge` recebeu `min-width: 0` e
`white-space: normal` (quebra **dentro** da badge em vez de empurrar a linha), e
os grupos de título ganharam `flex-1` para ceder espaço antes de a badge.
Badges curtos (`KID`, `4 DIAS`, `SAÚDE`) continuam em uma linha.

### 5.3 Alvos de toque da barra de abas em 320 px

Com 7 abas, o padding horizontal de 8 px deixava cada aba com 43 px — abaixo
dos 44 px da WCAG 2.5.5 (AAA), o padrão declarado pelo projeto. **Correção:**
abaixo de 360 px o padding cai para 4 px e a aba passa a 45 px.
Verificado em 320 / 360 / 390 / 412 px: **zero estouro horizontal em todas as
combinações de tela × largura.**

### 5.4 A faixa da sequência lógica

O original fixa 4 caixas de 64 px + `mx-1.5` + `space-x-3` ≈ 340 px, o que
estoura qualquer tela com menos de 380 px de conteúdo. **Correção:** as caixas
continuam quadradas e com no máximo 64 px (`aspect-ratio: 1`, `flex: 0 1 64px`),
mas encurtam juntas. Em 320 px elas ficam com ~62 px.

### 5.5 `SupabaseSyncCoordinator` nunca detectava erro

O original reportava `success: true` mesmo com a escrita falhando, porque o
supabase-js **resolve** com `{ data, error }` em vez de lançar — o `catch` era
código morto. **Correção:** a porta confere o status HTTP de verdade e sinaliza
honestamente quando não há credenciais, para a UI cair no texto de fallback em
vez de mentir para o usuário.

### 5.6 Auditoria 2026-10 — o que a web NÃO herda do app original

| Antes (fiel ao original) | Agora |
| :--- | :--- |
| Perfil de demonstração "Maria" (14 desafios, Kid, streak 4) na 1ª execução | **Zeros**: Brain Baby, 0 desafios, sequência 0. Saudação sem nome ("Bom dia!"); com nome só se existir `evermind_user_name` |
| Fallbacks `\|\| 4/3/5/2/4` no resumo semanal | Zeros reais; a mensagem de "primeiro dia" é alcançável |
| Tocar no card da Tríade alternava a conclusão (+1/-1) | Tocar só **navega** (abre o jogo exato quando a rota o nomeia: `navigate('BRAIN_GYM', { game: 'SEQUENCE' })`); concluído só pela atividade real, por **data**, nunca desfeito |
| Streak só calculado na Home, nunca persistido | `recordActivity` persiste `currentStreak/totalActiveDays/lastActiveDate` em **qualquer** atividade concluída |
| Resumo semanal com contadores vitalícios | Janela rolante de 7 dias a partir do **log de conclusões** (últimos 60 dias) |
| Badges recalculadas a cada abertura; "Semana Ativa" = 7 dias | Badges persistidas com `unlockedAt` + toast gentil; **Semana Ativa = ≥ 5 dos últimos 7 dias** (ADR-0009) |
| Botão "Compartilhar" só mostrava um toast | `navigator.share` com texto pt-BR; sem suporte, copia para a área de transferência |
| Botão "Sincronizar na Nuvem (Supabase)" sempre visível | Só aparece com credenciais configuradas e sem jargão ("Guardar cópia de segurança") |
| "ZERAR", selos KID/BABY/TEEN/MEGA, "EM PROGRESSO", "faltam N" | "RECOMEÇAR", Bebê/Criança/Jovem/Mestre, "Minhas conquistas", "Sua próxima conquista: …" |
| `aria-label` diferente do texto visível | O nome acessível sempre **contém** o texto visível (WCAG 2.5.3) |
| Storage ilegível recebia a semente por cima | Cópia em `<chave>_backup` + aviso gentil, só então recomeça limpo |

---

## 6. Adições em relação ao original

Três, todas deliberadas:

1. **Feedback háptico real.** O original instanciava `MockFeedbackService` em
   todos os hooks, que só incrementava contadores — ou seja, **todo o feedback
   era inerte em produção**, apesar de o ADR-0005 prever háptica e áudio. A web
   aproveita a mesma interface de 3 métodos para entregar uma vibração curta via
   Vibration API (pulada se `prefers-reduced-motion`).
2. **Aviso de evolução do Cérebro Virtual.** A spec
   (`docs/features/rewards-and-brain-evolution.md` §1.3) previa uma celebração de
   3 segundos na troca de estágio, mas o app nunca implementou. A porta anuncia
   com um toast breve e discreto, sem confete barulhento nem cor de alerta.
3. **Formação de Palavras com o que decidir + 4 jogos novos (outubro/2026).**
   O jogo de palavras original dizia "TODAS as sugestões são válidas": não havia
   nada a decidir. Agora cada desafio (10, de letras e temas variados) tem
   `validSuggestions` e `distractors` — palavras *claramente* erradas, de dois
   tipos sem ambiguidade (tema certo + letra errada, ou letra certa + tema
   errado) —, a instrução diz exatamente o que tocar ("Toque em 3 FRUTAS que
   começam com M") e tocar num distrator é uma dica carinhosa composta dos dados
   + opção tracejada, sem perder nada. A rotação avança desafio a desafio
   (`nextChallengeIndex`), em vez de repetir ao acaso.
   Para dar **variedade** (não mais jogos de palavras), entraram 4 jogos de
   outros tipos, todos com o mesmo caminho de conclusão
   (`recordActivity`, pilar `MIND`, `game:<chave>`, +1 desafio / +10 pontos, uma
   vez por rodada) e sem cronômetro:

   | Jogo | Chave | Habilidade | Detalhe |
   | :--- | :--- | :--- | :--- |
   | Pares | `game:pairs` | memória | 12 cartas (3×4), 2 por vez; erro vira de volta após ~1,2 s e **tocar noutra carta não bloqueia**; sem `prefers-reduced-motion` a carta vira com uma animação curta |
   | Complete o Ditado | `game:proverbs` | cultura/linguagem | 29 ditados tradicionais, 3 opções, mostra o ditado inteiro + significado |
   | Conta do Mercado | `game:market` | cálculo | 21 contas em 3 faixas (somar, troco de R$ 10/20/50, 2 × preço); dinheiro em **centavos inteiros**, `R$ 7,50` só na borda |
   | Ordem Certa | `game:order` | funções executivas | 15 rotinas de 4 passos; números 1–4 nos toques, DESFAZER, RECOMEÇAR |

   Os controles que "apagam" (opção errada, passo já escolhido) usam
   `aria-disabled` + borda tracejada, **não** `disabled` nativo: o foco do
   teclado/leitor de tela não se perde no redesenho. Cartas e passos têm
   `data-focus-key`. Os motores são puros e determinísticos por semente
   (`game-utils.js`); nenhum afeta o catálogo da Tríade do Dia.

---

## 7. Nuvem (Supabase) — opcional e desligado por padrão

O app é **100% offline-first**. Sem credenciais, o botão *Sincronizar na Nuvem*
mostra `Salvo localmente no dispositivo`, que é o comportamento correto.

Para ativar, crie `js/config.js`:

```js
window.EVERMIND_CONFIG = {
  supabaseUrl: 'https://seu-projeto.supabase.co',
  supabaseKey: 'sua-chave-anon-publica',
};
```

e carregue **antes** de `js/domain/supabase-client.js` no `index.html`.
Alternativamente, grave em `localStorage`:

```js
localStorage.setItem('evermind:supabaseUrl', 'https://seu-projeto.supabase.co');
localStorage.setItem('evermind:supabaseKey', 'sua-chave-anon-publica');
```

> ⚠️ A porta usa a **REST API do PostgREST via `fetch`**, sem SDK. O único
> recurso usado é um `upsert`.
>
> ⚠️ **A tabela `user_progress_sync` não existe no schema** (`supabase/schema.sql`
> define `profiles`, `daily_triads`, `challenge_completions`,
> `virtual_brain_state`, `user_achievements`). Você precisa criá-la antes de
> habilitar a sync. O payload e o `userId` padrão (`'local_user_demo'`, que não
> é UUID) foram mantidos do original — ambos precisam de ajuste para funcionar
> contra o schema real.

---

## 8. Chaves de `localStorage`

Mesmos nomes do app original, com o prefixo `evermind:` acrescentado pelo
gateway para não colidir com nada do mesmo domínio.

| Chave | Conteúdo |
| :--- | :--- |
| `evermind:evermind_user_progress_v1` | progresso global: totais, estágio, `currentStreak/totalActiveDays/lastActiveDate`, `activeDates` (60 últimas), `triadCompletions` (`{data: [ids]}`), `completionLog` (`[{d,p,k}]`, 60 dias), `pillarTotals`, `badges` (`[{id, unlockedAt}]`) |
| `evermind:evermind_habits_state_v1` | caminhada, água, fruta, sono (relido do storage antes de cada gravação) |
| `evermind:evermind_social_state_v1` | ligações afetivas, lembrete |
| `evermind:evermind_mind_activities_count` | nº de jogos cognitivos concluídos |
| `evermind:evermind_completed_discoveries_count` | nº de descobertas concluídas |
| `evermind:evermind_discoveries_done_today_v1` | `{date, ids}` — descobertas concluídas hoje |
| `evermind:evermind_user_name` | **opcional** — nome para a saudação (JSON string ou texto puro) |
| `evermind:<chave>_backup` (`_backup_2`) | cópia de um valor ilegível/inválido, criada antes de recomeçar limpo |

Para **resetar** o app: `localStorage.clear()` e recarregue.

Na primeira execução, sem nada armazenado, o app começa em **zeros** (Brain
Baby, 0 desafios, sequência 0). O antigo perfil "Maria" foi removido; se um
armazenamento antigo contiver exatamente aquela semente, ele é copiado para
`..._backup` e substituído por zeros.

**Novos pontos de integração:** `EM.app.today()`, `EM.app.recordActivity(opts)`,
`EM.app.navigate(screenId, params)`, `EM.domain.progressTracker`
(= `gentleStreakManager`), `EM.domain.dailyTriadCoordinator.resolveRoute()`,
`EM.screens.brainGym.openGame(id)`, `gateway.getRaw/quarantine/consumeNotices`.

---

## 9. Verificação executada

Toda a verificação foi feita no navegador, contra um servidor local, e está
reproduzível. Resultado (verificação original, anterior à auditoria 2026-10): **41 asserções, 41 aprovadas, 0 erros de console.** A suíte `tests/` cobre o comportamento atual.

| Área | Verificado |
| :--- | :--- |
| Tríade do Dia | hash `1161874306` para `'2026-08-19'`; trio e pilares corretos; determinismo; 3 pilares distintos |
| Cérebro Virtual | limiares 5/6/21/51; **nunca involui**; progresso global 6/20 = 30%; pontos = n×10 |
| Gentle Streak | hoje → mantém; 1º dia → 1; dia seguinte → +1; gap de 9 dias → sequência 1 com acumulado 31; `sanitizeMessage` remove "perdeu" |
| Badges | catálogo de 5; desbloqueia em 5; não re-desbloqueia; preserva `unlockedAt` |
| Memória | 5 alvos + 8 na grade; fecha nos 5 acertos; grade via ICU |
| Sequência | erro → dica + desativa; acerto → resolve |
| Palavras | 3 palavras que servem completam; distrator = dica carinhosa + opção desativada (não conta); duplicada/desconhecida = no-op; case-insensitive + trim |
| Atenção | erro → desativa sem resolver; acerto → resolve |
| Música | toggle de playback; erro não para a reprodução; acerto para |
| Storage | round-trip; ausente → `null`; namespace aplicado |
| Resumo semanal | 4 faixas de mensagem; total 14; janela de 7 dias `[hoje−6, hoje]` |
| Descoberta | 9 itens; 7 categorias; filtro respeitado; exclusões ignoradas quando o pool esgota |
| **Anti-culpa** | **zero** linguagem punitiva nas 7 telas + 5 jogos + estados de erro |
| **Layout** | **zero** estouro horizontal em 320/360/390/412/640 px × 7 telas + 5 jogos; alvos ≥ 44×48 px |

---

## 10. Armadilhas conhecidas

1. **O service worker é cache-first.** Depois de editar um `.js`/`.css`, o
   navegador pode servir a versão antiga. Para forçar:
   `DevTools → Application → Service Workers → Unregister`, e limpar
   `Local Storage` + `Cache Storage`. Ao desenvolver, vale desregistrar o SW
   uma vez e lembrar de limpar os caches a cada recarga.
2. **Os `<script>` são clássicos, não módulos ES**, de propósito: é o que
   permite abrir por `file://`. Se você migrar para `type="module"`, a opção
   `file://` passa a falhar e um servidor deixa de ser opcional.
3. **Estado de tela é closure de módulo.** O estado de cada tela
   (`activeGame`, rodadas, `timerStatus`) vive no closure do módulo e **sobrevive
   à troca de aba** — igual ao `useState` do React. Para "reiniciar" a tela
   inteira, recarregue a página.
4. **O `h()` é minimalista de propósito.** Sem sistema de props, sem
   reconciliação, sem batching. Se um dia as telas ficarem grandes demais para o
   redesenho completo, o próximo passo natural é diffing — mas isso seria uma
   decisão de arquitetura nova, não uma correção.
5. **`getCard`/componentes são funções, não classes.** Elas recebem um objeto de
   props como primeiro argumento e os filhos **variádicos**:
   `C.Card({ className: 'p-5' }, filho1, filho2)`. Passar filhos em
   `props.children` também funciona, mas o padrão no código é variádico.

## 11. Persistência por usuário (Supabase) — a conectar

O app ainda guarda tudo só no aparelho (`localStorage`). O banco por usuário já está
**modelado e testado** (`supabase/migrations/`, `supabase/tests/`), e há um mapeador de
referência em `js/domain/sync-mapper.js` (não carregado). O passo a passo para conectar,
o mapeamento chave-a-chave e o protocolo de sincronização estão em
[`docs/SUPABASE_HANDOFF.md`](../docs/SUPABASE_HANDOFF.md).
