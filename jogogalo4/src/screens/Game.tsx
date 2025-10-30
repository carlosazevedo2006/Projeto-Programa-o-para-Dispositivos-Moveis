// src/screens/Game.tsx

// ---------------------------------------------------------------
// Ecrã principal do jogo do galo, que suporta single e multiplayer.
// Inclui integração com o bot (fácil, médio, difícil) e modo escuro.
// ---------------------------------------------------------------

import React, { useState, useEffect, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from "react-native";
import { useTheme } from "../theme/Theme";

// Importa tipos e funções auxiliares do tabuleiro
import { Board, makeEmptyBoard, isBoardFull, cloneBoard } from "../utils/board";

// Importa lógica do bot e função de verificação do vencedor
import { BotDifficulty, chooseBotMoveByDifficulty, getWinner } from "../ai/bot";

// ---------------------------------------------------------------
// Tipagem das props recebidas pelo componente
// ---------------------------------------------------------------
type Props = {
  onWin?: () => void;                             // Chamado quando o jogador humano vence
  onDraw?: () => void;                            // Chamado quando há empate
  onLoss?: () => void;                            // Chamado quando o humano perde
  onExit?: () => void;                            // Chamado quando se sai do jogo
  onGameEnd?: (winner: "X" | "O" | null) => void; // Chamado ao final de qualquer jogo
  botEnabled?: boolean;                           // Define se há bot ativo
  botMark?: "X" | "O";                            // Símbolo do bot
  humanMark?: "X" | "O";                          // Símbolo do jogador
  botDifficulty?: BotDifficulty;                  // Dificuldade do bot: Facil | Medio | Dificil
};

// ---------------------------------------------------------------
// Componente principal do jogo
// ---------------------------------------------------------------
export default function Game({
  onWin,
  onDraw,
  onLoss,
  onExit,
  onGameEnd,
  botEnabled = false,
  botMark = "O",
  humanMark = "X",
  botDifficulty = "Medio",
}: Props) {
  // Acede às cores do tema global
  const { colors } = useTheme();

  // Estado do tabuleiro (matriz 3x3)
  const [board, setBoard] = useState<Board>(makeEmptyBoard());

  // Estado do turno atual ("X" ou "O")
  const [turn, setTurn] = useState<"X" | "O">("X");

  // Refs que guardam callbacks atuais (evita loops de renderização)
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);
  const onGameEndRef = useRef(onGameEnd);

  // Mantém as referências sincronizadas quando as props mudam
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  // Calcula o vencedor (se existir) e verifica se o tabuleiro está cheio
  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(() => isBoardFull(board), [board]);

  // Guarda o último resultado notificado para evitar repetições
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null);

  // ---------------------------------------------------------------
  // Efeito: quando o jogo termina, chama os callbacks corretos
  // ---------------------------------------------------------------
  useEffect(() => {
    // Se ainda não acabou, limpa estado anterior e sai
    if (!winner && !isFull) {
      endNotifiedRef.current = null;
      return;
    }

    // Cria chave do resultado final
    const endKey: "X" | "O" | "draw" = winner ? winner : "draw";

    // Se já foi notificado esse mesmo resultado, ignora
    if (endNotifiedRef.current === endKey) return;
    endNotifiedRef.current = endKey;

    // Notifica o componente pai (App.tsx)
    onGameEndRef.current?.(winner ?? null);

    // Atualiza estatísticas se estiver no modo singleplayer
    if (winner === humanMark) onWinRef.current?.();
    else if (winner === botMark) onLossRef.current?.();
    else if (!winner) onDrawRef.current?.();
  }, [winner, isFull, humanMark, botMark]);

  // Flag para impedir que o bot jogue várias vezes por erro
  const botThinkingRef = useRef(false);

  // ---------------------------------------------------------------
  // Efeito: executa a jogada do bot se for a vez dele
  // ---------------------------------------------------------------
  useEffect(() => {
    // Se não é a vez do bot ou já acabou, sai
    if (!botEnabled || winner || isFull || turn !== botMark || botThinkingRef.current) return;

    // Marca que o bot está "a pensar"
    botThinkingRef.current = true;

    // Pequeno atraso antes do bot jogar (efeito visual)
    const t: ReturnType<typeof setTimeout> = setTimeout(() => {
      // Escolhe uma jogada de acordo com a dificuldade
      const move = chooseBotMoveByDifficulty(board, botDifficulty, botMark, humanMark);

      // Se existir jogada válida, aplica-a
      if (move) {
        const [r, c] = move;
        const next = cloneBoard(board); // clona o tabuleiro
        if (next[r][c] === null) {
          next[r][c] = botMark; // coloca o símbolo do bot
          setBoard(next);        // atualiza o estado
          setTurn(humanMark);    // passa a vez para o humano
        }
      }

      // Liberta o bloqueio do bot
      botThinkingRef.current = false;
    }, 250);

    // Limpa o timeout se o componente for desmontado
    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, humanMark, board, winner, isFull, botDifficulty]);

  // ---------------------------------------------------------------
  // Animações das células
  // ---------------------------------------------------------------
  // Cria uma matriz de valores animados para as células (3x3)
  const scaleAnims = useRef<Animated.Value[][]>([
    [new Animated.Value(0.5), new Animated.Value(0.5), new Animated.Value(0.5)],
    [new Animated.Value(0.5), new Animated.Value(0.5), new Animated.Value(0.5)],
    [new Animated.Value(0.5), new Animated.Value(0.5), new Animated.Value(0.5)],
  ]).current;

  // Efeito para animar as células quando o tabuleiro muda
  useEffect(() => {
    board.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== null) {
          // Se a célula não é nula, anima para 1
          Animated.spring(scaleAnims[r][c], {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        } else {
          // Se é nula, volta para 0.5 (para quando reiniciar o jogo)
          scaleAnims[r][c].setValue(0.5);
        }
      });
    });
  }, [board, scaleAnims]);

  // ---------------------------------------------------------------
  // Quando o jogador toca numa célula
  // ---------------------------------------------------------------
  const handleCell = (r: number, c: number) => {
    if (winner || isFull) return; // se já terminou, não faz nada
    if (botEnabled && turn !== humanMark) return; // se for vez do bot, ignora

    const next = cloneBoard(board); // cria cópia
    if (next[r][c] !== null) return; // se já está ocupada, ignora

    next[r][c] = turn; // marca jogada
    setBoard(next);     // atualiza o estado
    setTurn(turn === "X" ? "O" : "X"); // alterna o turno
  };

  // ---------------------------------------------------------------
  // Reinicia o jogo
  // ---------------------------------------------------------------
  const handleReset = () => {
    setBoard(makeEmptyBoard());
    setTurn("X");
    botThinkingRef.current = false;
    endNotifiedRef.current = null;
  };

  // ---------------------------------------------------------------
  // Mostra alerta para sair
  // ---------------------------------------------------------------
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() },
    ]);
  };

  // ---------------------------------------------------------------
  // Renderização do ecrã
  // ---------------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título */}
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {/* Mostra papéis e dificuldade se o bot estiver ativo */}
      {botEnabled && (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {humanMark}   •   Bot: {botMark}   •   Dificuldade: {botDifficulty}
        </Text>
      )}

      {/* Mensagens de estado: vez, vencedor, empate */}
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

      {/* Renderiza o tabuleiro */}
      <View style={styles.board}>
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => {
              const cellValue = cell;
              // Determina se a célula deve estar desabilitada
              const isDisabled = !!cellValue || !!winner || isFull || (botEnabled && turn !== humanMark);
              return (
                <TouchableOpacity
                  key={`${r}-${c}`}
                  style={[
                    styles.cell,
                    {
                      borderColor: colors.border,
                      // Muda a cor de fundo se a célula estiver preenchida
                      backgroundColor: cellValue ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => handleCell(r, c)}
                  disabled={isDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={`Célula [${r+1},${c+1}]: ${cellValue || "Vazia"}`}
                  accessibilityState={{ disabled: isDisabled }}
                >
                  <Animated.View style={{ transform: [{ scale: scaleAnims[r][c] }] }}>
                    <Text style={[styles.cellText, { color: cellValue ? colors.card : colors.text }]}>
                      {cellValue ?? ""}
                    </Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
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

        {/* Espaço entre os botões */}
        <View style={{ width: 12 }} />

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

// ---------------------------------------------------------------
// Estilos visuais
// ---------------------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  roles: { fontSize: 14, marginBottom: 8 },
  info: { fontSize: 16, marginBottom: 12 },
  board: {},
  row: { flexDirection: "row" },
  cell: {
    width: 84,
    height: 84,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: 10,
  },
  cellText: { fontSize: 28, fontWeight: "800" },
  actions: { flexDirection: "row", marginTop: 24 },
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { fontSize: 14, fontWeight: "700" },
});