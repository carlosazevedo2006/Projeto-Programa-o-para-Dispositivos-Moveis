// src/ai/bot.ts

// Importa os tipos e funções utilitárias do tabuleiro
import { Board, Mark, cloneBoard } from "../utils/board";

// Dificuldades disponíveis (exportadas para serem usadas no App.tsx e SinglePlayer.tsx)
export type BotDifficulty = "Facil" | "Medio" | "Dificil";

// Retorna uma lista de todas as posições (células) vazias (null) do tabuleiro
export function availableMoves(board: Board): [number, number][] {
  const moves: [number, number][] = []; // Array para guardar as coordenadas [linha, coluna]
  // Itera por todas as 3 linhas
  for (let r = 0; r < 3; r++) {
    // Itera por todas as 3 colunas
    for (let c = 0; c < 3; c++) {
      // Se a célula [r][c] estiver vazia (null)
      if (board[r][c] === null) {
        // Adiciona as coordenadas [r, c] à lista de jogadas
        moves.push([r, c]);
      }
    }
  }
  return moves; // Retorna a lista de jogadas possíveis
}

// Retorna o vencedor atual (Mark) ou null se não houver vencedor
export function getWinner(b: Board): Mark | null {
  // Lista de todas as 8 linhas de vitória possíveis (3 horizontais, 3 verticais, 2 diagonais)
  const lines: (Mark | null)[][] = [
    [b[0][0], b[0][1], b[0][2]], // linha 0
    [b[1][0], b[1][1], b[1][2]], // linha 1
    [b[2][0], b[2][1], b[2][2]], // linha 2
    [b[0][0], b[1][0], b[2][0]], // coluna 0
    [b[0][1], b[1][1], b[2][1]], // coluna 1
    [b[0][2], b[1][2], b[2][2]], // coluna 2
    [b[0][0], b[1][1], b[2][2]], // diagonal 1
    [b[0][2], b[1][1], b[2][0]], // diagonal 2
  ];
  
  // Itera por cada linha de vitória
  for (const [a, b1, c] of lines) {
    // Se 'a' não for nulo E 'a' for igual a 'b1' E 'b1' for igual a 'c'
    if (a && a === b1 && b1 === c) {
      // Temos um vencedor
      return a; // Retorna a marca (X ou O)
    }
  }
  // Se nenhuma linha deu vitória, retorna null
  return null;
}

// ---------- Estratégias por dificuldade ----------

// 1. Fácil → escolhe a primeira casa livre que encontrar
export function chooseEasy(board: Board): [number, number] | null {
  const moves = availableMoves(board); // Obtém todas as jogadas livres
  // Retorna a primeira jogada (moves[0]) se existir, senão retorna null
  return moves.length > 0 ? moves[0] : null;
}

// 2. Médio → tenta ganhar, senão tenta bloquear, senão joga no centro/cantos
export function chooseMedium(board: Board, bot: Mark, human: Mark): [number, number] | null {
  const moves = availableMoves(board); // Obtém jogadas livres
  if (moves.length === 0) return null; // Se não há jogadas, retorna null

  // Tenta ganhar: Itera por todas as jogadas livres
  for (const [r, c] of moves) {
    const next = cloneBoard(board); // Simula a jogada
    next[r][c] = bot; // Coloca a marca do bot
    if (getWinner(next) === bot) return [r, c]; // Se isto der vitória, joga aqui
  }

  // Tenta bloquear: Itera por todas as jogadas livres
  for (const [r, c] of moves) {
    const next = cloneBoard(board); // Simula a jogada do humano
    next[r][c] = human; // Coloca a marca do humano
    if (getWinner(next) === human) return [r, c]; // Se o humano ganharia aqui, bloqueia
  }

  // Se ninguém ganhar, joga por prioridade estratégica
  // 1. Centro
  if (board[1][1] === null) return [1, 1];
  
  // 2. Cantos
  const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
  for (const [r, c] of corners) {
    if (board[r][c] === null) return [r, c]; // Joga no primeiro canto livre
  }
  
  // 3. Lados (arestas)
  const edges: [number, number][] = [[0, 1], [1, 0], [1, 2], [2, 1]];
  for (const [r, c] of edges) {
    if (board[r][c] === null) return [r, c]; // Joga na primeira aresta livre
  }

  // Se tudo falhar (improvável), joga na primeira disponível
  return moves[0] ?? null;
}

// --- Algoritmo Minimax (Dificuldade Difícil) ---

// Avaliação do tabuleiro: +10 vitória do bot, -10 derrota (vitória humana), 0 empate
function evaluate(board: Board, bot: Mark, human: Mark): number {
  const w = getWinner(board); // Verifica quem ganhou
  if (w === bot) return 10; // Bot ganhou = pontuação alta
  if (w === human) return -10; // Humano ganhou = pontuação baixa
  return 0; // Empate ou jogo a decorrer
}

// Minimax recursivo para o modo difícil
function minimax(board: Board, depth: number, isBotTurn: boolean, bot: Mark, human: Mark): number {
  // Verifica se o estado atual é terminal (alguém ganhou)
  const score = evaluate(board, bot, human);
  if (score === 10) return score - depth; // Bot ganha (subtrai profundidade para preferir vitórias rápidas)
  if (score === -10) return score + depth; // Humano ganha (soma profundidade para preferir derrotas lentas)

  // Verifica se é empate (não há mais jogadas)
  const moves = availableMoves(board);
  if (moves.length === 0) return 0; // Empate

  // Se for a vez do Bot (Maximizador)
  if (isBotTurn) {
    let best = -Infinity; // Inicia com o pior valor possível
    // Itera por todas as jogadas
    for (const [r, c] of moves) {
      const next = cloneBoard(board); // Clona o tabuleiro
      next[r][c] = bot; // Faz a jogada
      // Chama recursivamente o minimax para o humano (isBotTurn = false)
      best = Math.max(best, minimax(next, depth + 1, false, bot, human));
    }
    return best; // Retorna a melhor pontuação encontrada
  } 
  // Se for a vez do Humano (Minimizador)
  else {
    let best = Infinity; // Inicia com o pior valor possível
    // Itera por todas as jogadas
    for (const [r, c] of moves) {
      const next = cloneBoard(board); // Clona o tabuleiro
      next[r][c] = human; // Faz a jogada
      // Chama recursivamente o minimax para o bot (isBotTurn = true)
      best = Math.min(best, minimax(next, depth + 1, true, bot, human));
    }
    return best; // Retorna a "melhor" (mais baixa) pontuação para o bot
  }
}

// 3. Difícil → usa minimax para encontrar a melhor jogada (quase impossível vencer)
export function chooseHard(board: Board, bot: Mark, human: Mark): [number, number] | null {
  const moves = availableMoves(board); // Obtém jogadas livres
  if (moves.length === 0) return null; // Sem jogadas

  let bestVal = -Infinity; // A melhor pontuação encontrada (começa no mínimo)
  let bestMove: [number, number] = moves[0]; // A melhor jogada (começa com a primeira)

  // Itera por todas as jogadas possíveis
  for (const [r, c] of moves) {
    const next = cloneBoard(board); // Simula a jogada do bot
    next[r][c] = bot;
    
    // Avalia essa jogada chamando o minimax (agora é a vez do humano, isBotTurn = false)
    const val = minimax(next, 0, false, bot, human);
    
    // Se a pontuação desta jogada (val) for melhor que a melhor anterior (bestVal)
    if (val > bestVal) {
      bestVal = val; // Atualiza a melhor pontuação
      bestMove = [r, c]; // Atualiza a melhor jogada
    }
  }

  return bestMove; // Retorna a jogada com a maior pontuação
}

// Função principal que escolhe a jogada conforme a dificuldade
export function chooseBotMoveByDifficulty(
  board: Board,
  difficulty: BotDifficulty, // "Facil", "Medio", "Dificil"
  bot: Mark,
  human: Mark
): [number, number] | null {
  // Usa um switch para chamar a função de IA correta
  switch (difficulty) {
    case "Facil":
      return chooseEasy(board);
    case "Medio":
      return chooseMedium(board, bot, human);
    case "Dificil":
      return chooseHard(board, bot, human);
    default:
      // Se a dificuldade for desconhecida, usa "Medio" como fallback
      return chooseMedium(board, bot, human);
  }
}