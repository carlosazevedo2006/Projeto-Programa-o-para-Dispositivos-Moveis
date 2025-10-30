# Projeto-Programa-o-para-Dispositivos-Moveis
Trata-se do jogo do galo

Aqui vai um plano curto e prático, por prioridades, para levar o teu jogo de “ok” para “polido” e “publicável”.

## 1) Melhorias rápidas (1–2 horas)

* **Persistir tema e nome do jogador**

  * Guardar em AsyncStorage e aplicar no arranque, para o utilizador não ter de refazer escolhas.
  * Ex.: no ThemeProvider, carregar/salvar `darkMode`; no SinglePlayer, guardar o último nome usado.

* **Acessibilidade básica**

  * `accessible`, `accessibilityRole`, `accessibilityLabel` nos botões principais.
  * Aumentar `hitSlop` e garantir contraste suficiente no tema escuro.

* **Feedback tátil** 

  * Expo Haptics nas ações principais (marcar célula, vitória, derrota).
  * `expo install expo-haptics` e chamar haptics em `handleCell` e quando o jogo termina.

* **Animações simples** - CARLOS

  * Opacidade/scale ao marcar célula e pequeno “pop” no vencedor.
  * Dá para fazer com `Animated` ou `react-native-reanimated`/`moti` se quiseres suavidade extra.



* **Desfazer jogada (undo)** - NELSON

  * Manter uma pilha de estados do tabuleiro. Permite corrigir toque acidental e ajuda a testar.


* **Estados de fim mais claros**

  * Ao terminar, overlay com “Vitória”, “Empate”, “Derrota” e botões “Jogar de novo” e “Voltar ao menu”.


## 3) Estatísticas e meta-jogo

* **Mais métricas** 

  * Streaks de vitórias, tempo médio por jogo, taxa de vitória por dificuldade.
  * Guardar por data para gerar histórico.



* **Conquistas** - carlos

  * Exemplos: “3 vitórias seguidas”, “vitória em 3 jogadas”, “ganhou começando 2.º”.

## 4) Qualidade de código - so no final que vemos isso

* **Estabilizar callbacks com `useCallback`**

  * Já mitigaste loops com refs; ainda assim use `useCallback` nos handlers passados profundamente para reduzir renders.

* **Separar lógica do tabuleiro**

  * Extrair utilitários: `makeEmptyBoard`, `getWinner`, `isBoardFull`, `nextPlayer`, `availableMoves`.
  * Facilita testes unitários e evolução do bot.

* **Testes**

  * Unitários com Jest para lógica do jogo (vencedor, empate, minimax).
  * Testes de UI com React Native Testing Library para fluxos básicos.
  * Eventual E2E com Detox (arranque, marcar células, fim de jogo).

* **Tipos e contratos**

  * Garantir tipagem das props de todas as screens e componentes partilhados.
  * Preferir `ReadonlyArray` quando possível para funções puras.

## 5) Robustez e produção

* **Persistência centralizada**

  * Um pequeno “storage service” para todos os `get/set` com keys constantes. Facilita migrações.

* **Relato de erros e analytics**

  * Sentry para crashes.
  * Analytics básico (eventos: escolha de modo, dificuldade, resultado, tempo de jogo).

* **Configurar EAS Build**

  * Ícones, splash, nome do bundle, permissões limpas.
  * OTA updates com Expo Updates.

* **Suporte a rotação e tablets**

  * Layout responsivo para landscape e tablets (tamanhos de célula proporcionais à largura útil, por exemplo).

## 6) Detalhes de polimento

* **Haptics diferenciados**

  * Toque leve ao marcar, toque médio na vitória, toque de aviso na jogada inválida.

* **Micro-interações**

  * Realçar a célula jogada recentemente.
  * Linha vencedora destacada com cor/espessura/pequena animação.

* **Estado vazio amigável nas estatísticas**

  * Mostrar uma pequena mensagem/ilustração quando ainda não existem jogos.

* **Internacionalização**

  * Preparar i18n (pt, en). Mesmo que fiques só com pt agora, deixas a base pronta.

---

### Pequenos trechos de referência

1. Guardar e carregar tema no ThemeProvider:

```ts
useEffect(() => {
  (async () => {
    const raw = await AsyncStorage.getItem("@theme");
    if (raw) setDarkMode(JSON.parse(raw));
  })();
}, []);

useEffect(() => {
  AsyncStorage.setItem("@theme", JSON.stringify(darkMode));
}, [darkMode]);
```

2. Dificuldade do bot por heurística antes do fallback aleatório:

```ts
function chooseBotMoveHeuristic(board) {
  // 1) vitória imediata se existir
  // 2) bloquear vitória do humano se existir
  // 3) centro, cantos, lados
  // 4) senão, aleatório
}
```

3. Undo simples:

```ts
const [history, setHistory] = useState([initialBoard]);
const board = history[history.length - 1];
const push = (next) => setHistory((h) => [...h, next]);
const undo = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
```

---

Se quiseres, digo-te por onde começar nos próximos 60 minutos:

1. Persistir `darkMode` e nome.
2. Haptics e acessibilidade base.
3. “Fim de jogo” com overlay e “jogar de novo”.

Quando fechares isso, avançamos para dificuldade do bot e undo.
