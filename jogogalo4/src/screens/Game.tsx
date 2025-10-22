// src/screens/Game.tsx

// Importa React e hooks necessários
import React, { useState, useEffect, useMemo, useRef } from "react";
// Importa componentes do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// Importa tema global
import { useTheme } from "../theme/Theme";

// Define as props para este ecrã
type Props = {
  onWin?: () => void;            // chamado quando o humano vence
  onDraw?: () => void;           // chamado quando há empate
  onLoss?: () => void;           // chamado quando o humano perde (bot vence)
  onExit?: () => void;           // sair do jogo
  botEnabled?: boolean;          // ativa bot no singleplayer
  botMark?: "X" | "O";           // qual símbolo o bot usa
};

// Gera um tabuleiro 3x3 vazio
const makeEmptyBoard = () =>
  [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ] as (null | "X" | "O")[][];

// Determina o vencedor do tabuleiro
function getWinner(b: (null | "X" | "O")[][]): "X" | "O" | null {
  const lines: (("X" | "O" | null)[])[] = [
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

// Estratégia simples do bot: escolhe a primeira casa livre
function chooseBotMove(board: (null | "X" | "O")[][]): [number, number] | null {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) return [r, c];
    }
  }
  return null;
}

// Componente principal do jogo
export default function Game({
  onWin,
  onDraw,
  onLoss,
  onExit,
  botEnabled = false,  // por omissão não há bot
  botMark = "O",       // por omissão o bot joga como "O"
}: Props) {
  // Paleta do tema atual
  const { colors } = useTheme();

  // Estado do tabuleiro com valor inicial seguro
  const [board, setBoard] = useState<(null | "X" | "O")[][]>(makeEmptyBoard());
  // Estado do turno atual
  const [turn, setTurn] = useState<"X" | "O">("X");

  // Refs para callbacks, para não depender da identidade das funções nas deps
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);

  // Sincroniza as refs sempre que as props mudem
  useEffect(() => { onWinRef.current  = onWin;  }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);

  // Cálculo do estado do jogo
  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(() => board.every((row) => row.every((c) => c !== null)), [board]);

  // Determina o símbolo do humano conforme o símbolo do bot
  const humanMark: "X" | "O" = botMark === "X" ? "O" : "X";

  // Efeito de término do jogo, depende apenas de winner e isFull
  useEffect(() => {
    if (winner === humanMark) onWinRef.current && onWinRef.current();
    else if (winner === botMark) onLossRef.current && onLossRef.current();
    else if (!winner && isFull) onDrawRef.current && onDrawRef.current();
  }, [winner, isFull, humanMark, botMark]);

  // Evita decisões múltiplas do bot sobrepostas
  const botThinkingRef = useRef(false);

  // Efeito que executa a jogada do bot quando for a vez dele
  useEffect(() => {
    if (!botEnabled) return;     // sem bot, não faz nada
    if (winner || isFull) return;// se terminou, não faz nada
    if (turn !== botMark) return;// só age no turno do bot
    if (botThinkingRef.current) return; // evita múltiplas execuções

    botThinkingRef.current = true; // marca que o bot está a decidir
    const t = setTimeout(() => {
      const move = chooseBotMove(board);           // escolhe uma jogada simples
      if (move) {
        const [r, c] = move;                       // extrai linha e coluna
        const next = board.map((row) => row.slice());// clona o tabuleiro
        if (next[r][c] === null) {                 // valida a célula
          next[r][c] = botMark;                    // marca jogada do bot
          setBoard(next);                          // atualiza tabuleiro
          setTurn(humanMark);                      // passa a vez ao humano
        }
      }
      botThinkingRef.current = false;              // liberta a flag
    }, 250);                                       // pequeno atraso para fluidez

    return () => clearTimeout(t);                  // cleanup do timeout
  }, [botEnabled, turn, botMark, humanMark, board, winner, isFull]);

  // Handler de toque numa célula pelo humano
  const handleCell = (r: number, c: number) => {
    if (winner) return;                            // não permite jogadas após término
    if (botEnabled && turn !== humanMark) return;  // se houver bot, respeita turno

    const next = board.map((row) => row.slice());  // clona tabuleiro
    if (next[r][c] !== null) return;               // ignora células ocupadas

    next[r][c] = humanMark;                        // marca jogada do humano
    setBoard(next);                                // atualiza tabuleiro
    setTurn(botEnabled ? botMark : (humanMark === "X" ? "O" : "X")); // alterna turno
  };

  // Reinicia a partida
  const handleReset = () => {
    setBoard(makeEmptyBoard());                    // limpa tabuleiro
    setTurn("X");                                  // X começa novamente
    botThinkingRef.current = false;                // limpa flag do bot
  };

  // Confirmação de saída
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() },
    ]);
  };

  // Render do ecrã de jogo
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {!winner && !isFull && (
        <Text style={[styles.info, { color: colors.text }]}>
          Vez do: {turn} {botEnabled && turn === botMark ? "(bot)" : ""}
        </Text>
      )}
      {winner && (
        <Text style={[styles.info, { color: colors.text }]}>
          Vencedor: {winner} {botEnabled && winner === botMark ? "(bot)" : ""}
        </Text>
      )}
      {!winner && isFull && (
        <Text style={[styles.info, { color: colors.text }]}>Empate</Text>
      )}

      <View style={styles.board}>
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <TouchableOpacity
                key={`${r}-${c}`}
                style={[
                  styles.cell,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={() => handleCell(r, c)}
              >
                <Text style={[styles.cellText, { color: colors.text }]}>
                  {cell ?? ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleReset}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Reiniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleExit}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos do ecrã de jogo
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" }, // layout centralizado
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },                           // título
  info: { fontSize: 16, marginBottom: 12 },                                              // texto informativo
  board: { },                                                                             // wrapper do tabuleiro
  row: { flexDirection: "row" },                                                          // linha do tabuleiro
  cell: {
    width: 84, height: 84, borderWidth: 1, alignItems: "center", justifyContent: "center",
    margin: 2, borderRadius: 10,
  },
  cellText: { fontSize: 28, fontWeight: "800" },                                          // X/O
  actions: { flexDirection: "row", marginTop: 24, gap: 12 },                              // botões
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }, // botão
  buttonText: { fontSize: 14, fontWeight: "700" },                                        // texto do botão
});
