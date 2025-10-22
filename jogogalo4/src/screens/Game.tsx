// src/screens/Game.tsx

// Importa React e hooks
import React, { useState, useEffect, useMemo, useRef } from "react";
// Importa componentes base do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// Importa o tema global
import { useTheme } from "../theme/Theme";

// Define as props aceitas pelo componente de jogo
type Props = {
  onWin?: () => void;                             // callback quando o humano vence (single)
  onDraw?: () => void;                            // callback quando há empate
  onLoss?: () => void;                            // callback quando o humano perde (single)
  onExit?: () => void;                            // callback ao sair do jogo
  onGameEnd?: (winner: "X" | "O" | null) => void; // callback genérico para multiplayer ou single
  botEnabled?: boolean;                           // ativa o bot no singleplayer
  botMark?: "X" | "O";                            // símbolo usado pelo bot
  humanMark?: "X" | "O";                          // símbolo do humano
};

// Função que cria um tabuleiro 3x3 vazio
const makeEmptyBoard = () =>
  [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ] as (null | "X" | "O")[][];

// Função que determina o vencedor do tabuleiro
function getWinner(b: (null | "X" | "O")[][]): "X" | "O" | null {
  // Todas as combinações vencedoras possíveis
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

  // Percorre as linhas e retorna o símbolo vencedor
  for (const [a, b1, c] of lines) {
    if (a && a === b1 && b1 === c) return a;
  }
  return null; // caso não haja vencedor
}

// Função simples para o bot: escolhe a primeira casa vazia
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
  onGameEnd,
  botEnabled = false,
  botMark = "O",
  humanMark = "X",
}: Props) {
  // Usa o tema atual
  const { colors } = useTheme();

  // Estado do tabuleiro
  const [board, setBoard] = useState<(null | "X" | "O")[][]>(makeEmptyBoard());
  // Estado de quem tem a vez (X começa por convenção)
  const [turn, setTurn] = useState<"X" | "O">("X");

  // Resolve quem é o humano e o bot
  const effectiveHumanMark: "X" | "O" = humanMark;
  const effectiveBotMark: "X" | "O" = botMark;

  // Refs para callbacks, evitando reexecuções
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);
  const onGameEndRef = useRef(onGameEnd);

  // Sincroniza as refs sempre que as props mudarem
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  // Calcula o vencedor e se o tabuleiro está cheio
  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(() => board.every((row) => row.every((c) => c !== null)), [board]);

  // Garante que só notifica o fim uma vez
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null);

  // Efeito que trata o fim de jogo (vitória, derrota ou empate)
  useEffect(() => {
    if (!winner && !isFull) {
      endNotifiedRef.current = null;
      return;
    }

    const endKey: "X" | "O" | "draw" = winner ? winner : "draw";
    if (endNotifiedRef.current === endKey) return;
    endNotifiedRef.current = endKey;

    // Chama callback genérico para o App
    if (onGameEndRef.current) {
      onGameEndRef.current(winner ?? null);
    }

    // Callbacks antigos (mantêm suporte ao sistema de estatísticas)
    if (winner === effectiveHumanMark) {
      onWinRef.current && onWinRef.current();
    } else if (winner === effectiveBotMark) {
      onLossRef.current && onLossRef.current();
    } else if (!winner) {
      onDrawRef.current && onDrawRef.current();
    }
  }, [winner, isFull, effectiveHumanMark, effectiveBotMark]);

  // Evita que o bot jogue múltiplas vezes seguidas
  const botThinkingRef = useRef(false);

  // Efeito para fazer o bot jogar quando for a vez dele
  useEffect(() => {
    if (!botEnabled) return;          // se o bot estiver desativado, sai
    if (winner || isFull) return;     // se o jogo terminou, sai
    if (turn !== botMark) return;     // se não for a vez do bot, sai
    if (botThinkingRef.current) return;

    botThinkingRef.current = true;

    // Atraso para simular "pensamento" do bot
    const t = setTimeout(() => {
      const move = chooseBotMove(board); // escolhe jogada simples
      if (move) {
        const [r, c] = move;
        const next = board.map((row) => row.slice());
        if (next[r][c] === null) {
          next[r][c] = botMark;      // coloca o símbolo do bot
          setBoard(next);
          setTurn(humanMark);        // passa a vez para o humano
        }
      }
      botThinkingRef.current = false;
    }, 300);

    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, humanMark, board, winner, isFull]);

  // Quando o humano toca numa célula
  const handleCell = (r: number, c: number) => {
    if (winner) return;                                 // ignora se já acabou
    if (botEnabled && turn !== humanMark) return;       // ignora se não for a vez do humano

    const next = board.map((row) => row.slice());       // copia tabuleiro
    if (next[r][c] !== null) return;                    // ignora se ocupado

    next[r][c] = turn;                                  // marca a jogada
    setBoard(next);                                     // atualiza tabuleiro
    setTurn(turn === "X" ? "O" : "X");                  // troca turno
  };

  // Reinicia a partida
  const handleReset = () => {
    setBoard(makeEmptyBoard());                         // limpa o tabuleiro
    setTurn("X");                                       // X começa
    botThinkingRef.current = false;                     // limpa estado do bot
    endNotifiedRef.current = null;                      // limpa fim anterior
  };

  // Sair do jogo com confirmação
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() },
    ]);
  };

  // Renderização principal
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título */}
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {/* Indicação de papéis no singleplayer */}
      {botEnabled && (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {effectiveHumanMark}   •   Bot: {effectiveBotMark}
        </Text>
      )}

      {/* Estado atual do jogo */}
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

      {/* Tabuleiro */}
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

      {/* Botões inferiores */}
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

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  roles: {
    fontSize: 14,
    marginBottom: 8,
  },
  info: {
    fontSize: 16,
    marginBottom: 12,
  },
  board: {},
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 84,
    height: 84,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: 10,
  },
  cellText: {
    fontSize: 28,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
