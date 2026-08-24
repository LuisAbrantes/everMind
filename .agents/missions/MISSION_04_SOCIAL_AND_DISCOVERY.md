# Missão 04: Telas 5 e 6 — Afeto, Conexão & Curiosidade

**Status:** ⏳ PENDENTE / PRONTO PARA EXECUÇÃO

## Contexto & Regras Obrigatórias
- **Skills a Usar:** `codebase-design`, `tdd`, `mobile-ui-ux-design`.
- **Sensibilidade Emocional:** Redução do isolamento sênior com propostas gentis e acessíveis.
- **Design:** Black & White shadcn + Geist.

## Escopo das Telas:
1. **Tela 5: Desafio da Conexão (`src/screens/SocialConnectionScreen/`):**
   - Pergunta norteadora: *"Quem você não vê há algum tempo?"*
   - Pergunta do dia para quebrar o gelo: *"Como foi o seu dia hoje?"*
   - Ações: `[ EU VOU LIGAR ]` (abre discador com número ou registra intenção) e `[ LEMBRAR MAIS TARDE ]`.
   - Pontuação no pilar `connection`.
2. **Tela 6: Descubra Algo Novo (`src/screens/DiscoveryScreen/`):**
   - 7 Categorias de Curiosidade: Música, Leitura, Desenho, Jardinagem, Receita Nova, Aprender Palavra Nova, Fotografia.
   - Botão de Destaque: `[ 🎲 SURPREENDER-ME ]` (sorteia um micro-desafio de descoberta inédito).

## Entregáveis da Missão:
1. `src/modules/social/SocialCoordinator.ts` e `src/modules/discovery/DiscoveryEngine.ts` com testes unitários.
2. `src/screens/SocialConnectionScreen/` (`SocialConnectionView.tsx`, `useSocialConnection.ts`).
3. `src/screens/DiscoveryScreen/` (`DiscoveryView.tsx`, `useDiscovery.ts`).
4. Execução de testes passando via `cmd /c npm test`.
