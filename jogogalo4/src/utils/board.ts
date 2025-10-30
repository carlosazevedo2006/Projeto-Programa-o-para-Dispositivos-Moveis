// src/utils/board.ts

// Tipo que representa uma marca possível (X ou O)
export type Mark = "X" | "O";

// Cada célula pode conter uma marca (Mark) ou estar vazia (null)
export type Cell = Mark | null;

// Um tabuleiro é uma matriz 3x3 (array de arrays) de células
export type Board = Cell[][];

// Função que cria um tabuleiro vazio (3x3 com null em todas as células)
export function makeEmptyBoard(): Board {
  return [
    [null, null, null], // linha 0
    [null, null, null], // linha 1
    [null, null, null], // linha 2
  ];
}

// Determina se o tabuleiro está completamente cheio (empate)
export function isBoardFull(board: Board): boolean {
  // .every() verifica se *todos* os elementos cumprem a condição
  // Verifica se todas as linhas (.every(row => ...))
  // têm todas as células preenchidas (.every(cell => cell !== null))
  return board.every(row => row.every(cell => cell !== null));
}

// Clona o tabuleiro (cria uma nova matriz com os mesmos valores)
// Isto é essencial para evitar mutações diretas do estado no React
export function cloneBoard(board: Board): Board {
  // .map() cria um novo array
  // row.slice() cria uma cópia de cada array de linha
  return board.map(row => row.slice());
}