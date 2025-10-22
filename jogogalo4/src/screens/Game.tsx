// src/screens/Game.tsx

// Importa React e hooks necessários
import React, { useState, useEffect, useMemo, useRef } from "react";
// Importa componentes do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// Importa o tema global
import { useTheme } from "../theme/Theme";

// Define as props aceitas pelo componente de jogo
type Props = {
  onWin?: () => void;                             // callback quando o humano vence (single)
  onDraw?: () => void;                            // callback quando há empate
  onLoss?: () => void;                            // callback quando o humano perde (single)
  onExit?: () => void;                            // callback ao sair do jogo
  onGameEnd?: (winner: "X" | "O" | null) => void; // novo: notifica símbolo vencedor ou null no empate
  botEnabled?: boolean;                           // ativa o bot no singleplayer
  botMark?: "X" | "O";                            // símbolo usado pelo bot
  humanMark?: "X" | "O";                          // símbolo do humano (opcional; se não vier é inferido)
};

// Função utilitária: cria um tabuleiro 3x3 vazio
const makeEmptyBoard = () =>
  [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ] as (null | "X" | "O")[][];

// Função utilitária: calcula o vencedor do tabuleiro
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

// Estratégia simples do bot: primeira casa livre
function chooseBotMove(board: (null | "X" | "O")[][]): [number, number] | null {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) return [r, c];
    }
  }
  return null;
}

// Componente principal do ecrã de jogo
export default function Game({
  onWin,
  onDraw,
  onLoss,
  onExit,
  onGameEnd,                // novo callback para multiplayer e lógica genérica
  botEnabled = false,
  botMark = "O",
  humanMark,
}: Props) {
  // Obtém as cores do tema atual
  const { colors } = useTheme();

  // Estado do tabuleiro, sempre com valor inicial válido
  const [board, setBoard] = useState<(null | "X" | "O")[][]>(makeEmptyBoard());
  // Estado de quem tem a vez
  const [turn, setTurn] = useState<"X" | "O">("X");

  // Resolve a marca do humano: usa prop se existir, senão infere
  const effectiveHumanMark: "X" | "O" =
    humanMark ?? (botMark === "X" ? "O" : "X");

  // Refs para callbacks, evitando loops por mudança de identidade
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);
  const onGameEndRef = useRef(onGameEnd);

  // Mantém as refs sincronizadas quando as props mudarem
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  // Estado derivado: vencedor e se o tabuleiro está cheio
  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(() => board.every((row) => row.every((c) => c !== null)), [board]);

  // Efeito de término do jogo: aciona callbacks uma única vez por resultado
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null); // guarda último fim notificado
  useEffect(() => {
    // Se ainda não terminou, limpa a memória de notificação e sai
    if (!winner && !isFull) {
      endNotifiedRef.current = null;
      return;
    }

    // Determina uma chave de fim para não notificar em duplicado
    const endKey: "X" | "O" | "draw" = winner ? winner : "draw";
    if (endNotifiedRef.current === endKey) return; // já notificou este fim

    // Marca como notificado
    endNotifiedRef.current = endKey;

    // Notificação genérica para o App: quem venceu ou null se empate
    if (onGameEndRef.current) {
      onGameEndRef.current(winner ?? null);
    }

    // Callbacks legacy para singleplayer (opcionais)
    if (winner === effectiveHumanMark) {
      onWinRef.current && onWinRef.current();
    } else if (winner === botMark) {
      onLossRef.current && onLossRef.current();
    } else if (!winner) {
      onDrawRef.current && onDrawRef.current();
    }
  }, [winner, isFull, effectiveHumanMark, botMark]);

  // Evita decisões múltiplas do bot enquanto há timeout pendente
  const botThinkingRef = useRef(false);

  // Efeito: jogada do bot quando é a vez dele
  useEffect(() => {
    if (!botEnabled) return;
    if (winner || isFull) return;
    if (turn !== botMark) return;
    if (botThinkingRef.current) return;

    botThinkingRef.current = true;
    const t = setTimeout(() => {
      const move = chooseBotMove(board);
      if (move) {
        const [r, c] = move;
        const next = board.map((row) => row.slice());
        if (next[r][c] === null) {
          next[r][c] = botMark;
          setBoard(next);
          setTurn(effectiveHumanMark);
        }
      }
      botThinkingRef.current = false;
    }, 250);

    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, effectiveHumanMark, board, winner, isFull]);

  // Handler de toque numa célula pelo humano
  const handleCell = (r: number, c: number) => {
    if (winner) return;
    if (botEnabled && turn !== effectiveHumanMark) return;

    const next = board.map((row) => row.slice());
    if (next[r][c] !== null) return;

    next[r][c] = effectiveHumanMark;
    setBoard(next);
    setTurn(botEnabled ? botMark : (effectiveHumanMark === "X" ? "O" : "X"));
  };

  // Reinicia a partida
  const handleReset = () => {
    setBoard(makeEmptyBoard());
    setTurn("X");
    botThinkingRef.current = false;
    endNotifiedRef.current = null;
  };

  // Confirmação de saída
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() },
    ]);
  };

  // Render do ecrã
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título */}
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {/* Linha informativa com papéis quando há bot */}
      {botEnabled ? (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {effectiveHumanMark}   •   Bot: {botMark}
        </Text>
      ) : null}

      {/* Informação de vez, vencedor ou empate */}
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

      {/* Tabuleiro 3x3 */}
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

      {/* Ações básicas */}
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

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 16, alignItems: "center", justifyContent: "center",
  },
  title: {
    fontSize: 22, fontWeight: "700", marginBottom: 4,
  },
  roles: {
    fontSize: 14, marginBottom: 8,
  },
  info: {
    fontSize: 16, marginBottom: 12,
  },
  board: { },
  row: { flexDirection: "row" },
  cell: {
    width: 84, height: 84, borderWidth: 1, alignItems: "center",
    justifyContent: "center", margin: 2, borderRadius: 10,
  },
  cellText: { fontSize: 28, fontWeight: "800" },
  actions: { flexDirection: "row", marginTop: 24, gap: 12 },
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { fontSize: 14, fontWeight: "700" },
});
