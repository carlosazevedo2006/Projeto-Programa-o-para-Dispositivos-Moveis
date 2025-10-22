// src/ai/bot.ts

import { Board, Mark, cloneBoard } from "../utils/board";

// Dificuldades disponíveis
export type BotDifficulty = "easy" | "medium" | "hard";

// Retorna todas as posições vazias do tabuleiro
export function availableMoves(board: Board): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) moves.push([r, c]);
    }
  }
  return moves;
}

// Retorna o vencedor atual (ou null se não houver)
export function getWinner(b: Board): Mark | null {
  const lines: (Mark | null)[][] = [
    [b[0][0], b[0][1], b[0][2]],
    [b[1][0], b[1][1], b[1][2]],
    [b[2][0], b[2][1], b[2][2]],
    [b[0][0], b[1][0], b[2][0]],
    [b[0][1], b[1][1], b[2][1]],
    [b[0][2], b[1][2], b[2][2]],
    [b[0][0], b[1][1], b[2][2]],
    [b[0][2], b[1][1], b[2][0]],
  ];
  for (const [a, b1, c] of lines) {
    if (a && a === b1 && b1 === c) return a;
  }
  return null;
}

// ---------- Estratégias por dificuldade ----------

// 1. Fácil → escolhe a primeira casa livre
export function chooseEasy(board: Board): [number, number] | null {
  const moves = availableMoves(board);
  return moves.length > 0 ? moves[0] : null;
}

// 2. Médio → tenta ganhar ou bloquear
export function chooseMedium(board: Board, bot: Mark, human: Mark): [number, number] | null {
  const moves = availableMoves(board);
  if (moves.length === 0) return null;

  // Tenta ganhar
  for (const [r, c] of moves) {
    const next = cloneBoard(board);
    next[r][c] = bot;
    if (getWinner(next) === bot) return [r, c];
  }

  // Tenta bloquear
  for (const [r, c] of moves) {
    const next = cloneBoard(board);
    next[r][c] = human;
    if (getWinner(next) === human) return [r, c];
  }

  // Escolhe centro, cantos ou lados
  if (board[1][1] === null) return [1, 1];
  const corners: [number, number][] = [[0, 0], [0, 2], [2, 0], [2, 2]];
  for (const [r, c] of corners) if (board[r][c] === null) return [r, c];
  const edges: [number, number][] = [[0, 1], [1, 0], [1, 2], [2, 1]];
  for (const [r, c] of edges) if (board[r][c] === null) return [r, c];

  return moves[0] ?? null;
}

// Avaliação para minimax: +10 vitória do bot, -10 derrota, 0 empate
function evaluate(board: Board, bot: Mark, human: Mark): number {
  const w = getWinner(board);
  if (w === bot) return 10;
  if (w === human) return -10;
  return 0;
}

// Minimax recursivo para o modo difícil
function minimax(board: Board, depth: number, isBotTurn: boolean, bot: Mark, human: Mark): number {
  const score = evaluate(board, bot, human);
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;

  const moves = availableMoves(board);
  if (moves.length === 0) return 0;

  if (isBotTurn) {
    let best = -Infinity;
    for (const [r, c] of moves) {
      const next = cloneBoard(board);
      next[r][c] = bot;
      best = Math.max(best, minimax(next, depth + 1, false, bot, human));
    }
    return best;
  } else {
    let best = Infinity;
    for (const [r, c] of moves) {
      const next = cloneBoard(board);
      next[r][c] = human;
      best = Math.min(best, minimax(next, depth + 1, true, bot, human));
    }
    return best;
  }
}

// 3. Difícil → usa minimax (quase impossível vencer)
export function chooseHard(board: Board, bot: Mark, human: Mark): [number, number] | null {
  const moves = availableMoves(board);
  if (moves.length === 0) return null;

  let bestVal = -Infinity;
  let bestMove: [number, number] = moves[0];

  for (const [r, c] of moves) {
    const next = cloneBoard(board);
    next[r][c] = bot;
    const val = minimax(next, 0, false, bot, human);
    if (val > bestVal) {
      bestVal = val;
      bestMove = [r, c];
    }
  }

  return bestMove;
}

// Função que escolhe a jogada conforme a dificuldade
export function chooseBotMoveByDifficulty(
  board: Board,
  difficulty: BotDifficulty,
  bot: Mark,
  human: Mark
): [number, number] | null {
  switch (difficulty) {
    case "easy":
      return chooseEasy(board);
    case "medium":
      return chooseMedium(board, bot, human);
    case "hard":
      return chooseHard(board, bot, human);
    default:
      return chooseMedium(board, bot, human);
  }
}
