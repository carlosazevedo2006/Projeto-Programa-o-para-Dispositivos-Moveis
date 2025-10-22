export type Difficulty = "easy" | "medium" | "hard";
type Cell = null | "X" | "O";

// -----------------------------------------------------------------------------
// Função principal do bot, agora com dificuldade
// Neste momento o bot ira avaliar as dificuldades, consoante a escolha do jogador
// -----------------------------------------------------------------------------
export const botMove = (
  board: Cell[],
  botMark: "X" | "O" = "O",
  difficulty: Difficulty = "medium"
): number | null => {
  switch (difficulty) {
    case "easy":
      return randomMove(board);
    case "medium":
      return heuristicMove(board, botMark);
    case "hard":
      return minimaxMove(board, botMark);
  }
};

// -----------------------------------------------------------------------------
// Easy: qualquer posição livre aleatória
// -----------------------------------------------------------------------------
function randomMove(board: Cell[]): number | null {
  const empty = board.map((v, i) => (!v ? i : null)).filter((v) => v !== null) as number[];
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// -----------------------------------------------------------------------------
// Medium: vitória > bloqueio > centro > cantos > lados
// -----------------------------------------------------------------------------
function heuristicMove(board: Cell[], bot: "X" | "O"): number | null {
  const human: "X" | "O" = bot === "X" ? "O" : "X";

  // 1️⃣ Tenta vencer
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      const temp = [...board];
      temp[i] = bot;
      if (checkWinner(temp) === bot) return i;
    }
  }

  // 2️⃣ Bloqueia humano
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      const temp = [...board];
      temp[i] = human;
      if (checkWinner(temp) === human) return i;
    }
  }

  // 3️⃣ Estratégia: centro > cantos > lados
  if (!board[4]) return 4;

  const corners = [0, 2, 6, 8].filter((i) => !board[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  const sides = [1, 3, 5, 7].filter((i) => !board[i]);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  return null;
}

// -----------------------------------------------------------------------------
// Hard: Minimax para jogada perfeita
// -----------------------------------------------------------------------------
function minimaxMove(board: Cell[], bot: "X" | "O"): number | null {
  const human: "X" | "O" = bot === "X" ? "O" : "X";

  function minimax(b: Cell[], isMax: boolean): number {
    const winner = checkWinner(b);
    if (winner === bot) return 10;
    if (winner === human) return -10;
    if (b.every((c) => c)) return 0;

    const scores: number[] = [];
    for (let i = 0; i < b.length; i++) {
      if (!b[i]) {
        const copy = [...b];
        copy[i] = isMax ? bot : human;
        scores.push(minimax(copy, !isMax));
      }
    }

    return isMax ? Math.max(...scores) : Math.min(...scores);
  }

  let bestScore = -Infinity;
  let bestMove: number | null = null;

  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      const copy = [...board];
      copy[i] = bot;
      const score = minimax(copy, false);
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }

  return bestMove;
}

// -----------------------------------------------------------------------------
// Função que verifica vencedor ou empate
// -----------------------------------------------------------------------------
const checkWinner = (b: Cell[]): "X" | "O" | "Empate" | null => {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b1, c] of wins) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }

  if (b.every((c) => c !== null)) return "Empate";

  return null;
};
