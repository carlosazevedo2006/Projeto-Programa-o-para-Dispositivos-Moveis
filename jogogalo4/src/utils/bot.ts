// -----------------------------------------------------------------------------
// Algoritmo que define a jogada do bot no modo "Single Player"
// -----------------------------------------------------------------------------

// Exporta a função principal "botMove" que recebe o tabuleiro atual
export const botMove = (board: (null | "X" | "O")[]): number | null => {
  // O bot joga sempre com "O"
  const bot = "O";
  const human = "X";

  // ---------------------------------------------------------------------------
  // 1️⃣ Passo: Verifica se o bot pode vencer nesta jogada
  // ---------------------------------------------------------------------------
  for (let i = 0; i < board.length; i++) {
    // Se a posição estiver vazia
    if (!board[i]) {
      // Faz uma cópia do tabuleiro
      const temp = [...board];
      // Simula a jogada do bot
      temp[i] = bot;
      // Se após jogar o bot vencer, retorna essa posição imediatamente
      if (checkWinner(temp) === bot) return i;
    }
  }

  // ---------------------------------------------------------------------------
  // 2️⃣ Passo: Impede o humano de vencer no próximo turno
  // ---------------------------------------------------------------------------
  for (let i = 0; i < board.length; i++) {
    // Testa posições vazias
    if (!board[i]) {
      const temp = [...board];
      temp[i] = human; // simula jogada do humano
      if (checkWinner(temp) === human) return i; // bloqueia o humano
    }
  }

  // ---------------------------------------------------------------------------
  // 3️⃣ Passo: Caso não haja vitórias ou bloqueios, escolhe jogada estratégica
  // ---------------------------------------------------------------------------
  // Centro do tabuleiro é a melhor jogada
  if (!board[4]) return 4;

  // Cantos são boas opções
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter((c) => !board[c]);
  if (emptyCorners.length > 0) {
    // Escolhe um canto aleatório
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }

  // Caso não haja cantos livres, joga num lado qualquer disponível
  const sides = [1, 3, 5, 7];
  const emptySides = sides.filter((s) => !board[s]);
  if (emptySides.length > 0) {
    // Escolhe um lado aleatório
    return emptySides[Math.floor(Math.random() * emptySides.length)];
  }

  // ---------------------------------------------------------------------------
  // 4️⃣ Se o tabuleiro estiver cheio e não houver jogada possível → retorna null
  // ---------------------------------------------------------------------------
  return null;
};

// -----------------------------------------------------------------------------
// Função auxiliar "checkWinner" que determina se há vencedor
// -----------------------------------------------------------------------------
const checkWinner = (b: (null | "X" | "O")[]): "X" | "O" | "Empate" | null => {
  // Lista de todas as combinações vencedoras
  const wins = [
    [0, 1, 2], // Linha 1
    [3, 4, 5], // Linha 2
    [6, 7, 8], // Linha 3
    [0, 3, 6], // Coluna 1
    [1, 4, 7], // Coluna 2
    [2, 5, 8], // Coluna 3
    [0, 4, 8], // Diagonal principal
    [2, 4, 6], // Diagonal secundária
  ];

  // Percorre todas as combinações
  for (const [a, b1, c] of wins) {
    // Se três casas contêm o mesmo símbolo (X ou O)
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) {
      return b[a]; // retorna o vencedor
    }
  }

  // Se todas as casas estiverem preenchidas e ninguém venceu → empate
  if (b.every((cell) => cell !== null)) return "Empate";

  // Caso contrário, ainda não há vencedor
  return null;
};
