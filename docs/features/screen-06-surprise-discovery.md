# Feature Spec: Tela 06 — Descubra Algo Novo (7 Categorias & Botão SURPREENDER-ME)

> **Identificador:** `screen-06-surprise-discovery`  
> **Pilar Central:** Expansão Cognitiva & Neuroplasticidade  
> **Objetivo Cognitivo:** Estimular a curiosidade, exploração lúdica de novos hobbies e aprendizado contínuo através de descobertas prazerosas e acessíveis.

---

## 🎲 1. Anatomia Visual e Componentes da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ 🎲 Descubra Algo Novo                        [ 🏠 Início ]  │
│ Escolha um tema ou deixe o acaso surpreender você:          │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          ✨ [ 🎲 SURPREENDER-ME AGORA! ]                │ │
│ │   Toque aqui para sortear um passatempo especial!       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 📚 OU EXPLORE POR CATEGORIA:                                │
│                                                             │
│ [ 🎵 Música ]        [ 📖 Leitura ]       [ 🎨 Desenho ]    │
│ [ 🌿 Jardinagem ]    [ 🍳 Receita ]       [ 📝 Palavra Nova]│
│ [ 📷 Fotografia ]                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🌟 DESCOBERTA SORTEADA:                                  │ │
│ │ 🌿 Categoria: Jardinagem                                │ │
│ │ 🏷️ "Converse com suas plantas por 3 minutos"            │ │
│ │                                                         │ │
│ │ Dica: Observe as folhas novas de um vaso e retire folhas│ │
│ │ secas com carinho. Acalma a mente e conecta à natureza! │ │
│ │                                                         │ │
│ │          [ ✅ CONCLUÍ ESTA DESCOBERTA! ]                 │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Modelo de Dados e Catálogo de Descobertas

```typescript
export type DiscoveryCategory =
  | 'MUSIC'
  | 'READING'
  | 'DRAWING'
  | 'GARDENING'
  | 'RECIPE'
  | 'NEW_WORD'
  | 'PHOTOGRAPHY';

export interface IDiscoveryItem {
  id: string;
  category: DiscoveryCategory;
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  description: string;
  practicalTip: string;
}

export interface IDiscoveryScreenState {
  selectedCategory: DiscoveryCategory | 'ALL';
  currentDiscovery: IDiscoveryItem | null;
  isRollingAnimation: boolean;
  completedDiscoveriesCount: number;
  completedHistoryIds: string[];
}
```

---

## 🔄 3. Fluxo do Botão `[ SURPREENDER-ME ]` e Roleta Lúdica

1. **Toque no Botão de Sorteio:**
   - O botão `[ 🎲 SURPREENDER-ME AGORA! ]` inicia uma rotação suave de ícones coloridos por 1.2 segundos acompanhada de som de carrilhão leve (*wind chime*).
2. **Revelação do Desafio:**
   - A carta da descoberta é exibida com animação de flip suave, destacando o ícone temático, título e instrução prática.
3. **Execução e Conclusão:**
   - O usuário realiza a atividade e toca em `[ ✅ CONCLUÍ ESTA DESCOBERTA! ]`.
   - Feedback: Parabenização carinhosa, som afirmativo e acréscimo de nutrientes ao Cérebro Virtual.

---

## ♿ 4. Acessibilidade Sênior (WCAG AAA)

- **Animações Respeitosas:** A roleta não utiliza luzes piscantes rápidas (respeito a sensibilidade fotoelétrica / *reduced motion*).
- **Botões de Categorias:** Grades largas com ícones grandes e texto descritivo legível (`18sp`).
- **Botão `[ SURPREENDER-ME ]`:** Destaque em gradiente azul ciano/índigo com altura de `60dp`.

---

## 🧪 5. Critérios de Aceitação

- [ ] O sorteio não repete a mesma descoberta nos últimos 7 dias a menos que o catálogo tenha sido completamente percorrido.
- [ ] O banco de dados de descobertas funciona 100% offline a partir de coleção JSON interna.
- [ ] Testes unitários cobrem o algoritmo de sorteio ponderado e os filtros de categoria.
