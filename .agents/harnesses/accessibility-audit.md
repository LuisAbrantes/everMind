# Harness: Auditoria de Acessibilidade Sênior (WCAG AAA)

> **Objetivo:** Estabelecer o checklist e protocolo de inspeção rigorosa para garantir que qualquer tela, modal ou componente do everMind esteja em conformidade com as diretrizes de acessibilidade e ergonomia sênior.

---

## 🧭 Passo 1: Contexto e Persona

1. Ler `docs/DECISIONS.md` (ADR-0005: Acessibilidade Sênior e WCAG AAA).
2. Adotar a persona [`.agents/senior-ux-accessibility.md`](../senior-ux-accessibility.md).

---

## 🔍 Passo 2: Checklist de Auditoria por Dimensão

### 1. Ergonomia e Áreas de Toque (*Touch Targets*)
- [ ] Todo botão, ícone clicável ou card possui área de toque mínima de **$48 \times 48\text{dp}$**?
- [ ] O botão de ação primária possui altura recomendada de **$56\text{dp}$** com largura expansiva?
- [ ] Existe espaçamento de pelo menos **$12\text{dp}$** entre botões adjacentes para evitar toques incorretos?

### 2. Tipografia e Escala de Texto
- [ ] O tamanho da fonte para leitura e parágrafos é no mínimo **$18\text{sp}$**?
- [ ] Os títulos possuem tamanho entre **$22\text{sp}$ e $28\text{sp}$** com peso tipográfico destacado (`semi-bold` ou `bold`)?
- [ ] Os textos suportam redimensionamento dinâmico (*Dynamic Type / Font Scaling*) sem cortar palavras ou sobrepor elementos?

### 3. Contraste e Percepção Cromática
- [ ] A razão de contraste entre o texto corrido e o fundo é de no mínimo **$7:1$** (WCAG AAA)?
- [ ] A razão de contraste para componentes gráficos essenciais e ícones é de pelo menos **$4.5:1$**?
- [ ] A cor é acompanhada de texto ou ícone correspondente (evitando transmitir informações apenas por cores)?

### 4. Suporte a Leitores de Tela (TalkBack e VoiceOver)
- [ ] Elementos interativos possuem `accessible={true}` e `accessibilityRole` adequado (`button`, `header`, `image`)?
- [ ] O `accessibilityLabel` descreve claramente a ação a ser realizada (ex.: *"Marcar caminhada de 10 minutos como concluída"* em vez de apenas *"Concluir"*)?
- [ ] Modais e alertas capturam o foco de acessibilidade corretamente ao serem abertos?

### 5. Carga Cognitiva e Psicologia Acolhedora
- [ ] A jornada da tela pode ser compreendida em menos de 5 segundos?
- [ ] Não existem temporizadores regressivos com contagem de pânico ou sons estridentes?
- [ ] O texto está 100% livre de culpabilização ou termos punitivos?

---

## 📝 Passo 3: Modelo de Relatório de Conformidade

Ao concluir a auditoria de um componente ou tela, emita o seguinte relatório:

```markdown
### Relatório de Auditoria de Acessibilidade: <NomeDaTela>
- **Status Geral:** [ APROVADO | REQUER AJUSTES ]
- **Proporção de Contraste Médio:** [ Ex: 8.2:1 (Conforme AAA) ]
- **Menor Área de Toque Identificada:** [ Ex: 52x52dp (Conforme) ]
- **Tamanho Mínimo de Fonte:** [ Ex: 18sp (Conforme) ]
- **Pontos de Atenção / Correções Recomendadas:**
  1. [Descrever ajuste se necessário]
```
