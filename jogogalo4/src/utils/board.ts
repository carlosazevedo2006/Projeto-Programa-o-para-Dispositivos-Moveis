// src/utils/board.ts

// Tipo que representa uma marca possível
export type Mark = "X" | "O";

// Cada célula pode conter uma marca ou estar vazia
export type Cell = Mark | null;

// Um tabuleiro é uma matriz 3x3 de células
export type Board = Cell[][];

// Cria um tabuleiro vazio (3x3 com null em todas as células)
export function makeEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}

// Determina se o tabuleiro está completamente cheio
export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// Clona o tabuleiro (cria uma nova matriz com os mesmos valores)
export function cloneBoard(board: Board): Board {
  return board.map(row => row.slice());
}
