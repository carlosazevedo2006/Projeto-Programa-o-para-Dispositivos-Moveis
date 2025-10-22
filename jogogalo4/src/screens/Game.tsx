// src/screens/Game.tsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useTheme } from "../theme/Theme";

import { Difficulty, botMove } from "../logic/bot";

type Props = {
  onWin?: () => void;
  onDraw?: () => void;
  onLoss?: () => void;
  onExit?: () => void;
  botEnabled?: boolean;
  botMark?: "X" | "O";
  humanMark?: "X" | "O";
  difficulty?: Difficulty; // prop nova
};

// Cria um tabuleiro 3x3 vazio
const makeEmptyBoard = () =>
  [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ] as (null | "X" | "O")[][];

// Determina o vencedor
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
  for (const [a, b1, c] of lines) if (a && a === b1 && a === c) return a;
  return null;
}

export default function Game({
  onWin,
  onDraw,
  onLoss,
  onExit,
  botEnabled = false,
  botMark = "O",
  humanMark = "X",
  difficulty = "medium",
}: Props) {
  const { colors } = useTheme();

  const [board, setBoard] = useState<(null | "X" | "O")[][]>(makeEmptyBoard());
  const [turn, setTurn] = useState<"X" | "O">("X");

  const effectiveHumanMark: "X" | "O" = humanMark;
  const effectiveBotMark: "X" | "O" = botMark;

  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);

  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);

  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(() => board.every((row) => row.every((c) => c !== null)), [board]);

  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null);

  useEffect(() => {
    if (!winner && !isFull) {
      endNotifiedRef.current = null;
      return;
    }

    const endKey: "X" | "O" | "draw" = winner ? winner : "draw";
    if (endNotifiedRef.current === endKey) return;
    endNotifiedRef.current = endKey;

    if (winner === effectiveHumanMark) {
      onWinRef.current && onWinRef.current();
    } else if (winner === effectiveBotMark) {
      onLossRef.current && onLossRef.current();
    } else if (!winner) {
      onDrawRef.current && onDrawRef.current();
    }
  }, [winner, isFull, effectiveHumanMark, effectiveBotMark]);

  const botThinkingRef = useRef(false);

  // Bot joga quando é a vez dele
  useEffect(() => {
    if (!botEnabled) return;
    if (winner || isFull) return;
    if (turn !== botMark) return;
    if (botThinkingRef.current) return;

    botThinkingRef.current = true;

    const t = setTimeout(() => {
      const flatBoard = board.flat();
      const move1D = botMove(flatBoard, difficulty);
      if (move1D !== null) {
        const r = Math.floor(move1D / 3);
        const c = move1D % 3;
        const next = board.map((row) => row.slice());
        if (next[r][c] === null) {
          next[r][c] = botMark;
          setBoard(next);
          setTurn(humanMark);
        }
      }
      botThinkingRef.current = false;
    }, 300);

    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, humanMark, board, winner, isFull, difficulty]);

  const handleCell = (r: number, c: number) => {
    if (winner) return;
    if (botEnabled && turn !== humanMark) return;

    const next = board.map((row) => row.slice());
    if (next[r][c] !== null) return;

    next[r][c] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
  };

  const handleReset = () => {
    setBoard(makeEmptyBoard());
    setTurn("X");
    botThinkingRef.current = false;
    endNotifiedRef.current = null;
  };

  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {botEnabled && (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {effectiveHumanMark} • Bot: {effectiveBotMark}
        </Text>
      )}

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
                style={[styles.cell, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={() => handleCell(r, c)}
              >
                <Text style={[styles.cellText, { color: colors.text }]}>{cell ?? ""}</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  roles: { fontSize: 14, marginBottom: 8 },
  info: { fontSize: 16, marginBottom: 12 },
  board: {},
  row: { flexDirection: "row" },
  cell: { width: 84, height: 84, borderWidth: 1, alignItems: "center", justifyContent: "center", margin: 2, borderRadius: 10 },
  cellText: { fontSize: 28, fontWeight: "800" },
  actions: { flexDirection: "row", marginTop: 24, gap: 12 },
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { fontSize: 14, fontWeight: "700" },
});
