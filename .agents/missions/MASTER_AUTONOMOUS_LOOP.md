# MASTER_AUTONOMOUS_LOOP: Protocolo de Execução Contínua em Loop Fechado

> 📋 **Instruções para o Usuário:** Copie e envie o bloco abaixo para o seu subagente. Ele executará todas as missões pendentes sequencialmente, validando cada etapa com testes automatizados até o término completo do aplicativo.

---

```markdown
Você é o Engenheiro Chefe de Desenvolvimento Autônomo do everMind (React Native + TypeScript + Supabase).
Sua missão é executar e concluir as Missões 02, 03, 04 e 05 do projeto em um LOOP FECHADO E AUTÔNOMO.

LEITURA OBRIGATÓRIA DE INVARIANTES ANTES DE COMEÇAR:
1. `CONTEXT.md` (Glossário e 4 Pilares da Longevidade)
2. `docs/DECISIONS.md` (ADR-0001 a ADR-0008)
3. `.agents/missions/` (Leia todos os arquivos de missão de 02 a 05)

SKILLS DO MATT POCOCK & DIRETRIZES ATIVAS:
- `codebase-design`: Deep modules, interfaces estreitas, seams puros e testáveis.
- `tdd`: Red-Green-Refactor. Cada módulo deve possuir seus testes unitários em `__tests__/`.
- `mobile-ui-ux-design` & `mobile-android-design`: Acessibilidade sênior WCAG AAA, textos >= 18sp, botões pílula >= 54dp, estilo Black & White shadcn + Geist.
- `supabase`: Sincronização e integridade de dados.

PROTOCOLO DO LOOP AUTÔNOMO (EXECUTE ETAPA POR ETAPA SEM PARAR):

🔁 ETAPA 1 — EXECUTAR MISSÃO 02: TELA 2 (GINÁSTICA CEREBRAL & 5 MINI-JOGOS)
1. Crie os 5 engines desacoplados em `src/modules/brain/`:
   - `MemoryGameEngine.ts` (Memória 5 imagens)
   - `SequenceGameEngine.ts` (Sequência numérica 2-4-6-?)
   - `WordsGameEngine.ts` (Palavras com letra específica)
   - `AttentionGameEngine.ts` (Atenção / Objeto diferente)
   - `MusicGameEngine.ts` (Reconhecimento de música)
2. Crie os testes unitários em `src/modules/brain/__tests__/` cobrindo todos os cenários lógicos.
3. Crie a interface em `src/screens/BrainGymScreen/` (`BrainGymScreenView.tsx`, subcomponentes de cada jogo e `useBrainGym.ts`).
4. Rode `cmd /c npm test` e garanta 100% de sucesso.

🔁 ETAPA 2 — EXECUTAR MISSÃO 03: TELAS 3 E 4 (HÁBITOS SOMÁTICOS)
1. Crie `src/modules/habits/HabitsCoordinator.ts` e seus testes em `src/modules/habits/__tests__/`.
2. Crie a Tela 3 em `src/screens/BodyMovementScreen/` (Caminhada 10 min, feedback tátil, pilar movement).
3. Crie a Tela 4 em `src/screens/SelfCareScreen/` (Missão da fruta/vegetal, hora da água, higiene do sono, pilar selfcare).
4. Rode `cmd /c npm test` e garanta 100% de sucesso.

🔁 ETAPA 3 — EXECUTAR MISSÃO 04: TELAS 5 E 6 (AFETO & DESCOBERTA)
1. Crie `src/modules/social/SocialCoordinator.ts` e `src/modules/discovery/DiscoveryEngine.ts` com testes unitários.
2. Crie a Tela 5 em `src/screens/SocialConnectionScreen/` (Ligar para alguém, "Como foi seu dia?", botões [ Lembrar Mais Tarde ] e [ Eu Vou Ligar ]).
3. Crie a Tela 6 em `src/screens/DiscoveryScreen/` (7 categorias de curiosidade + botão [ 🎲 Surpreender-me ]).
4. Rode `cmd /c npm test` e garanta 100% de sucesso.

🔁 ETAPA 4 — EXECUTAR MISSÃO 05: TELA 7 (MINHA SEMANA & SYNC SUPABASE)
1. Crie `src/modules/summary/WeeklySummaryCalculator.ts` e `src/modules/sync/SupabaseSyncCoordinator.ts` com testes.
2. Crie a Tela 7 em `src/screens/WeeklySummaryScreen/` (Consolidação dos 4 pilares, reforço positivo anti-culpa e galeria de conquistas/badges).
3. Crie a navegação global integrando as telas.
4. Rode `cmd /c npm test -- --coverage` e garanta que TODAS as suítes de teste de todo o projeto passem sem erros.

CRITÉRIO DE PARADA (DEFINITION OF DONE):
- Todas as 7 telas criadas e funcionais em `src/screens/`.
- Todos os motores lógicos testados com Jest e passando.
- Zero mensagens punitivas (Psicologia Anti-Culpa respeitada em 100% do código).
- Ao finalizar tudo, gere um relatório final detalhando cada tela e módulo construído.
```
