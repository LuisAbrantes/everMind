# Feature Spec: Tela 02 — Ginástica para o Cérebro (5 Mini-Jogos Cognitivos)

> **Identificador:** `screen-02-brain-gym`  
> **Pilar Central:** Mente (*Neuroestimulação & Neuroplasticidade*)  
> **Objetivo Cognitivo:** Exercitar memória de trabalho, raciocínio lógico, linguagem, discriminação visual e associação auditiva com jogos rápidos e prazerosos sem qualquer pressão de tempo.

---

## 🎮 1. As 5 Modalidades de Mini-Jogos

```
┌─────────────────────────────────────────────────────────────┐
│ 🧠 Ginástica para o Cérebro                  [ 🏠 Início ]  │
│ Escolha um jogo para exercitar sua mente com calma:         │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🖼️ 1. MEMÓRIA VISUAL                                    │ │
│ │ Guarde 5 imagens e encontre-as depois      [ JOGAR ]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔢 2. SEQUÊNCIA LÓGICA                                  │ │
│ │ Descubra o próximo número: 2 ➔ 4 ➔ 6 ➔ [?] [ JOGAR ]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔤 3. FORMAÇÃO DE PALAVRAS                              │ │
│ │ Encontre palavras iniciadas com a letra S  [ JOGAR ]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 👁️ 4. ATENÇÃO E DIFERENÇAS                              │ │
│ │ Descubra o elemento diferente no grupo     [ JOGAR ]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎵 5. RECONHECIMENTO MUSICAL                            │ │
│ │ Ouça o trecho e lembre a canção            [ JOGAR ]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Detalhamento e Regras dos Mini-Jogos

### Jogo 1: Memória Visual (5 Imagens)
- **Fluxo:** Exibe 5 imagens nítidas (ex.: *Maçã, Violão, Flor, Sol, Livro*) durante tempo livre. O usuário toca em *"Estou Pronto!"*.
- **Desafio:** A tela exibe 8 imagens e o usuário seleciona as 5 que viu anteriormente.
- **Feedback:** Cada acerto emite um brilho verde e som suave; ao completar os 5, exibe festa de estrelas.

### Jogo 2: Sequência Lógica ($2 \rightarrow 4 \rightarrow 6 \rightarrow [?]$)
- **Fluxo:** Apresenta uma progressão aritmética ou geométrica simples (ex.: $+2, +5, \times 2, -1$) com números em caixas grandes de $64\times 64\text{dp}$.
- **Opções:** Exibe 4 botões grandes de alternativas (ex.: `[ 7 ] [ 8 ] [ 9 ] [ 10 ]`).
- **Feedback:** Ao tocar no `8`, a caixa $[?]$ se transforma no número com brilho azul vibrante e vibração positiva.

### Jogo 3: Formação de Palavras
- **Fluxo:** Sorteia uma letra e **uma** categoria (ex.: *"Toque em 3 FRUTAS que começam com M"*).
- **Opções:** 8 palavras: 4 que servem + 4 claramente erradas (tema certo e letra errada, ou letra certa e tema errado). Tocar numa errada gera uma dica carinhosa (*"Quase! "Banana" é uma fruta, mas não começa com M. Tente outra."*), a opção fica desativada e nada é descontado. Completa ao encontrar 3.

### Jogo 4: Atenção e Diferenças
- **Fluxo:** Apresenta uma grade de 4 ou 6 ilustrações grandes e bem definidas, onde apenas uma contém uma variação suave (ex.: 3 relógios marcando 3h e um marcando 6h).
- **Ação:** Um toque simples sobre o objeto divergente resolve a rodada.

### Jogo 5: Reconhecimento Musical
- **Fluxo:** Toca um trecho curto de 5 a 10 segundos de uma melodia clássica ou canção popular brasileira bem conhecida (ex.: *Aquarela do Brasil, Asa Branca, Carinhoso*).
- **Opções:** 3 botões com nomes das canções para escolha relaxante.

---

### Jogos 6 a 9 (adicionados em outubro/2026 — variedade de habilidades)
- **Jogo 6 — Pares:** 12 cartas em grade 3×4; vira duas por vez; as que não combinam viram de volta após uma pausa calma (~1 s) sem bloquear toques; mostra *"Pares encontrados: n / 6"* e *"Tentativas"* (só um número neutro).
- **Jogo 7 — Complete o Ditado:** ditado popular com uma palavra faltando e 3 opções (1 certa, 2 plausíveis); ao acertar mostra o ditado inteiro e o significado em uma linha.
- **Jogo 8 — Conta do Mercado:** problemas curtos com R$ (somar 2 itens, troco de R$ 10/20/50, 2 × preço); ao acertar explica a conta em uma linha.
- **Jogo 9 — Ordem Certa:** 4 passos embaralhados de uma rotina; o usuário toca na ordem certa (números 1–4); DESFAZER tira o último; ordem errada = *"Quase! Vamos tentar de novo"* + RECOMEÇAR.

---

## 🛡️ 3. Regras de Design Sem Estresse

1. **Sem Cronômetro Regressivo:** O usuário pode demorar o tempo que quiser em qualquer rodada.
2. **Tentativas Ilimitadas com Dicas:** Se o usuário errar uma alternativa, a opção errada fica suavemente desabilitada e uma dica carinhosa surge na base da tela.
3. **Persistência do Progresso:** Cada jogo concluído soma 1 ponto de atividade ao Pilar Mente e computa nutrientes para o Cérebro Virtual.

---

## ♿ 4. Acessibilidade Sênior (WCAG AAA)

- Textos explicativos com fonte mínima de `20sp`.
- Ilustrações em alta resolução, sem poluição de fundo ou sombras confusas.
- Botões de resposta com altura mínima de `60dp` e largura de tela cheia.
- Compatibilidade integral com TalkBack e VoiceOver descrevendo o enunciado e alternativas com clareza.

---

## 🧪 5. Critérios de Aceitação

- [ ] Todas as 5 engines de jogo operam de forma isolada com testes unitários em TypeScript puro.
- [ ] A conclusão de qualquer um dos 5 jogos dispara o evento `ActivityCompletedEvent` com pilar `MIND`.
- [ ] O áudio e haptics são ativados adequadamente respeitando as preferências do usuário.
