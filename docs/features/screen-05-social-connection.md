# Feature Spec: Tela 05 — Desafio da Conexão (Afeto, Família & Amigos)

> **Identificador:** `screen-05-social-connection`  
> **Pilar Central:** Conexão (*Vínculo Afetivo, Socialização & Combate ao Isolamento*)  
> **Objetivo Cognitivo-Emocional:** Fomentar o contato humano espontâneo e caloroso, estimulando conversas significativas entre o usuário e seus amigos ou familiares queridos.

---

## ❤️ 1. Anatomia Visual e Componentes da Tela

```
┌─────────────────────────────────────────────────────────────┐
│ ❤️ Desafio da Conexão                        [ 🏠 Início ]  │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💌 "Quem você não vê ou não conversa há algum tempo?"  │ │
│ │                                                         │ │
│ │ Que tal fazer uma ligação rápida hoje e perguntar:      │ │
│ │                                                         │ │
│ │      🗣️ "Como foi o seu dia hoje?"                      │ │
│ │                                                         │ │
│ │ Uma conversa simples de 5 minutos alegra o coração de   │ │
│ │ quem fala e de quem escuta!                             │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          [ 📞 JÁ LIGUEI / VOU LIGAR AGORA ]             │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │          [ ⏰ LEMBRAR-ME MAIS TARDE ]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ 🌟 "Laços de afeto são o melhor remédio para a mente!"      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 2. Modelo de Dados e Estados

```typescript
export interface ISocialConnectionState {
  lastConnectionDate: string | null;
  totalSocialConnectionsCompleted: number;
  reminderScheduledTime?: string;
  isCompletedToday: boolean;
  promptSuggestions: string[];
}
```

---

## 🔄 3. Fluxo de Interação e Ações

1. **Leitura do Convite:**
   - A tela exibe um convite acolhedor sugerindo uma conversa afetuosa com alguém da família ou círculo de amigos.
2. **Opção `[ 📞 JÁ LIGUEI / VOU LIGAR AGORA ]`:**
   - O usuário confirma a ação com um toque no botão principal vermelho/rosa coral (`#F43F5E`).
   - Feedback: Chuva de corações flutuantes, som melódico suave e a mensagem:
     *"❤️ Que lindo gesto! Conversar fortalece memórias, laços e alegra o dia!"*.
   - Soma 1 ponto ao Pilar Conexão e avalia o avanço da badge *Amigo Presente* (10 conexões).
3. **Opção `[ ⏰ LEMBRAR-ME MAIS TARDE ]`:**
   - O usuário pode adiar sem qualquer sensação de penalidade ou culpa.
   - O aplicativo apenas agenda uma notificação carinhosa opcional para o meio da tarde (*"Que tal mandar um 'oi' carinhoso agora?"*).

---

## ♿ 4. Acessibilidade Sênior (WCAG AAA)

- **Áreas de Toque:** Botões com altura de `58dp` e fonte destacada de `20sp`.
- **Microcopy Empático:** Linguagem acolhedora que nunca questiona motivos ou faz cobranças sociais duras.
- **Rótulos de Acessibilidade:** Leitor de tela enuncia: *"Confirmar que realizou uma ligação ou contato com um amigo ou familiar hoje"*.

---

## 🧪 5. Critérios de Aceitação

- [ ] A confirmação da ligação atualiza o card da Tríade Diária na Home caso o desafio do dia envolva Conexão.
- [ ] O adiamento não gera mensagens negativas nem remove a oportunidade de conclusão no mesmo dia.
- [ ] Testes unitários validam a concessão da badge *Amigo Presente* ao atingir 10 conexões.
