// src/ai/bot.ts

// Define o tipo de marca possível no tabuleiro
export type Mark = "X" | "O"; // símbolos válidos

// Define o tipo de célula: pode ter uma marca ou estar vazia
export type Cell = Mark | null; // célula vazia é null

// Define o tipo de tabuleiro: matriz 3x3 de células
export type Board = Cell[][]; // 3 linhas x 3 colunas

// Dificuldades suportadas pelo bot
export type BotDifficulty = "easy" | "medium" | "hard"; // três níveis

// Retorna todas as posições livres do tabuleiro
export function availableMoves(board: Board): [number, number][] {
  // Cria um array para acumular posições vazias
  const moves: [number, number][] = [];
  // Percorre linhas
  for (let r = 0; r < 3; r++) {
    // Percorre colunas
    for (let c = 0; c < 3; c++) {
      // Se a célula está vazia, adiciona a posição
      if (board[r][c] === null) moves.push([r, c]);
    }
  }
  // Devolve a lista de posições livres
  return moves;
}

// Determina o vencedor do tabuleiro ou null se não houver
export function getWinner(b: Board): Mark | null {
  // Lista de linhas, colunas e diagonais vencedoras
  const lines: (Cell[])[] = [
    [b[0][0], b[0][1], b[0][2]],
    [b[1][0], b[1][1], b[1][2]],
    [b[2][0], b[2][1], b[2][2]],
    [b[0][0], b[1][0], b[2][0]],
    [b[0][1], b[1][1], b[2][1]],
    [b[0][2], b[1][2], b[2][2]],
    [b[0][0], b[1][1], b[2][2]],
    [b[0][2], b[1][1], b[2][0]],
  ];
  // Verifica se alguma linha tem três iguais
  for (const [a, b1, c] of lines) {
    if (a && a === b1 && b1 === c) return a as Mark;
  }
  // Sem vencedor
  return null;
}

// Estratégia fácil: escolher a primeira casa livre
export function chooseEasy(board: Board): [number, number] | null {
  // Obtém todas as jogadas possíveis
  const moves = availableMoves(board);
  // Se não há, retorna null
  if (moves.length === 0) return null;
  // Retorna simplesmente a primeira disponível
  return moves[0];
}

// Estratégia média: tenta ganhar, senão bloqueia; prefere centro, depois cantos e por fim lados
export function chooseMedium(board: Board, bot: Mark, human: Mark): [number, number] | null {
  // Lista de movimentos possíveis
  const moves = availableMoves(board);
  // Se não há jogadas, retorna null
  if (moves.length === 0) return null;

  // 1) Tentar vitória imediata
  for (const [r, c] of moves) {
    // Clona o tabuleiro
    const next = board.map(row => row.slice());
    // Simula jogada do bot
    next[r][c] = bot;
    // Se ganha com esta jogada, escolhe-a
    if (getWinner(next) === bot) return [r, c];
  }

  // 2) Bloquear vitória imediata do humano
  for (const [r, c] of moves) {
    // Clona o tabuleiro
    const next = board.map(row => row.slice());
    // Simula jogada do humano
    next[r][c] = human;
    // Se humano ganharia, bloqueia
    if (getWinner(next) === human) return [r, c];
  }

  // 3) Centro se disponível
  if (board[1][1] === null) return [1, 1];

  // 4) Cantos se disponíveis
  const corners: [number, number][] = [[0,0],[0,2],[2,0],[2,2]];
  for (const [r, c] of corners) {
    if (board[r][c] === null) return [r, c];
  }

  // 5) Lados por fim
  const edges: [number, number][] = [[0,1],[1,0],[1,2],[2,1]];
  for (const [r, c] of edges) {
    if (board[r][c] === null) return [r, c];
  }

  // Fallback (não deverá acontecer)
  return moves[0] ?? null;
}

// Avaliador do minimax: +10 para vitória do bot, -10 para vitória do humano, 0 empate
function evaluate(board: Board, bot: Mark, human: Mark): number {
  // Obtém vencedor
  const w = getWinner(board);
  // Se bot vence, valor positivo
  if (w === bot) return 10;
  // Se humano vence, valor negativo
  if (w === human) return -10;
  // Caso contrário, neutro/empate
  return 0;
}

// Implementa o algoritmo minimax para o tabuleiro 3x3
function minimax(board: Board, depth: number, isBotTurn: boolean, bot: Mark, human: Mark): number {
  // Avalia estado atual
  const score = evaluate(board, bot, human);
  // Se terminal por vitória, ajusta pelo depth
  if (score === 10) return score - depth;  // vitórias rápidas valem mais
  if (score === -10) return score + depth; // derrotas tardias penalizam menos
  // Lista de jogadas possíveis
  const moves = availableMoves(board);
  // Se não há jogadas, é empate
  if (moves.length === 0) return 0;

  // Turno do bot: maximiza
  if (isBotTurn) {
    let best = -Infinity;                                    // melhor inicial baixo
    for (const [r, c] of moves) {                            // testa cada jogada
      const next = board.map(row => row.slice());            // clona tabuleiro
      next[r][c] = bot;                                      // joga como bot
      const val = minimax(next, depth + 1, false, bot, human); // chamada recursiva
      if (val > best) best = val;                            // atualiza melhor valor
    }
    return best;                                             // retorna o melhor
  }

  // Turno do humano: minimiza
  let best = Infinity;                                       // melhor inicial alto
  for (const [r, c] of moves) {                              // testa cada jogada
    const next = board.map(row => row.slice());              // clona tabuleiro
    next[r][c] = human;                                      // joga como humano
    const val = minimax(next, depth + 1, true, bot, human);  // chamada recursiva
    if (val < best) best = val;                              // atualiza melhor valor
  }
  return best;                                               // retorna o pior para o bot
}

// Estratégia difícil: escolhe a jogada com o melhor valor minimax
export function chooseHard(board: Board, bot: Mark, human: Mark): [number, number] | null {
  // Obtém jogadas possíveis
  const moves = availableMoves(board);
  // Se não há, retorna null
  if (moves.length === 0) return null;

  // Inicia melhor valor e melhor movimento
  let bestVal = -Infinity;                // melhor pontuação
  let bestMove: [number, number] = moves[0]; // melhor jogada encontrada

  // Avalia cada jogada com minimax
  for (const [r, c] of moves) {
    const next = board.map(row => row.slice());                  // clona tabuleiro
    next[r][c] = bot;                                            // simula jogada do bot
    const moveVal = minimax(next, 0, false, bot, human);         // avalia com minimax
    if (moveVal > bestVal) {                                     // se melhorou
      bestVal = moveVal;                                         // guarda valor
      bestMove = [r, c];                                         // guarda jogada
    }
  }

  // Devolve a melhor jogada encontrada
  return bestMove;
}

// Seleciona a jogada do bot consoante a dificuldade escolhida
export function chooseBotMoveByDifficulty(
  board: Board,             // tabuleiro atual
  difficulty: BotDifficulty,// nível de dificuldade
  bot: Mark,                // símbolo do bot
  human: Mark               // símbolo do humano
): [number, number] | null {
  // Usa a estratégia correspondente ao nível
  switch (difficulty) {
    case "easy":
      return chooseEasy(board);                   // jogada simples
    case "medium":
      return chooseMedium(board, bot, human);     // heurísticas
    case "hard":
      return chooseHard(board, bot, human);       // minimax
    default:
      return chooseMedium(board, bot, human);     // fallback seguro
  }
}
