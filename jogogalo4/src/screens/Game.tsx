// src/screens/Game.tsx
// ---------------------------------------------------------------
// Ecrã principal do jogo do galo com melhorias de performance,
// acessibilidade, feedback visual e gestão de estado otimizada.
// ---------------------------------------------------------------

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Vibration,
  Platform
} from "react-native";
import { useTheme } from "../theme/Theme";

// Importa tipos e funções auxiliares do tabuleiro
import { Board, makeEmptyBoard, isBoardFull, cloneBoard } from "../utils/board";

// Importa lógica do bot e função de verificação do vencedor
import { BotDifficulty, chooseBotMoveByDifficulty, getWinner } from "../ai/bot";

// ---------------------------------------------------------------
// Tipagem das props recebidas pelo componente
// ---------------------------------------------------------------
type Props = {
  onWin?: () => void;                             // Callback para vitória do jogador
  onDraw?: () => void;                            // Callback para empate
  onLoss?: () => void;                            // Callback para derrota do jogador
  onExit?: () => void;                            // Callback para sair do jogo
  onGameEnd?: (winner: "X" | "O" | null) => void; // Callback genérico para fim de jogo
  botEnabled?: boolean;                           // Flag para modo singleplayer
  botMark?: "X" | "O";                            // Símbolo do bot
  humanMark?: "X" | "O";                          // Símbolo do jogador humano
  botDifficulty?: BotDifficulty;                  // Dificuldade do bot
};

// ---------------------------------------------------------------
// Componente principal do jogo com melhorias
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
  // Estado para controlar se o bot está a processar
  const [isBotProcessing, setIsBotProcessing] = useState(false);

  // Refs que guardam callbacks atuais (evita dependências nos useEffect)
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);
  const onGameEndRef = useRef(onGameEnd);

  // Animação para feedback visual das células
  const cellAnimations = useRef<Animated.Value[][]>(
    Array(3).fill(0).map(() => 
      Array(3).fill(0).map(() => new Animated.Value(0))
    )
  ).current;

  // Mantém as referências sincronizadas quando as props mudam
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  // Calcula o vencedor e estado do tabuleiro (memorizado para performance)
  const { winner, isFull, gameStatus } = useMemo(() => {
    const currentWinner = getWinner(board);
    const currentIsFull = isBoardFull(board);
    
    let status = "playing";
    if (currentWinner) status = "winner";
    else if (currentIsFull) status = "draw";
    
    return {
      winner: currentWinner,
      isFull: currentIsFull,
      gameStatus: status as "playing" | "winner" | "draw"
    };
  }, [board]);

  // Guarda o último resultado notificado para evitar repetições
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null);

  // ---------------------------------------------------------------
  // Efeito: Gestão do fim do jogo e callbacks
  // ---------------------------------------------------------------
  useEffect(() => {
    // Se o jogo ainda não terminou, limpa estado anterior e sai
    if (gameStatus === "playing") {
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

    // Atualiza estatísticas baseadas no resultado
    if (winner === humanMark) {
      onWinRef.current?.();
      // Feedback de vitória
      if (Platform.OS !== 'web') {
        Vibration.vibrate([0, 100, 50, 100]);
      }
    } else if (winner === botMark) {
      onLossRef.current?.();
      // Feedback de derrota
      if (Platform.OS !== 'web') {
        Vibration.vibrate(200);
      }
    } else if (gameStatus === "draw") {
      onDrawRef.current?.();
      // Feedback de empate
      if (Platform.OS !== 'web') {
        Vibration.vibrate(100);
      }
    }
  }, [gameStatus, winner, humanMark, botMark]);

  // ---------------------------------------------------------------
  // Efeito: Execução da jogada do bot
  // ---------------------------------------------------------------
  useEffect(() => {
    // Condições para o bot não jogar
    if (!botEnabled || 
        gameStatus !== "playing" || 
        turn !== botMark || 
        isBotProcessing) {
      return;
    }

    // Marca que o bot está a processar
    setIsBotProcessing(true);

    // Pequeno atraso para melhor UX (parece que o bot "pensa")
    const botDelay = setTimeout(() => {
      try {
        // Escolhe uma jogada de acordo com a dificuldade
        const move = chooseBotMoveByDifficulty(board, botDifficulty, botMark, humanMark);

        // Se existir jogada válida, aplica-a
        if (move) {
          const [r, c] = move;
          const next = cloneBoard(board);
          if (next[r][c] === null) {
            next[r][c] = botMark;
            setBoard(next);
            setTurn(humanMark);
            
            // Anima a jogada do bot
            animateCell(r, c);
          }
        }
      } catch (error) {
        console.error("Erro na jogada do bot:", error);
      } finally {
        setIsBotProcessing(false);
      }
    }, 350); // Delay aumentado para melhor experiência

    // Cleanup do timeout
    return () => {
      clearTimeout(botDelay);
      setIsBotProcessing(false);
    };
  }, [botEnabled, turn, botMark, humanMark, board, gameStatus, botDifficulty, isBotProcessing]);

  // ---------------------------------------------------------------
  // Função para animar uma célula quando é preenchida
  // ---------------------------------------------------------------
  const animateCell = useCallback((row: number, col: number) => {
    Animated.sequence([
      Animated.timing(cellAnimations[row][col], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cellAnimations[row][col], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cellAnimations]);

  // ---------------------------------------------------------------
  // Handler quando o jogador toca numa célula
  // ---------------------------------------------------------------
  const handleCellPress = useCallback((row: number, col: number) => {
    // Validações de estado do jogo
    if (gameStatus !== "playing") return;
    if (botEnabled && turn !== humanMark) return;
    if (board[row][col] !== null) return;

    // Cria nova versão do tabuleiro e aplica a jogada
    const newBoard = cloneBoard(board);
    newBoard[row][col] = turn;
    
    // Atualiza estado
    setBoard(newBoard);
    setTurn(turn === "X" ? "O" : "X");
    
    // Feedback visual e tátil
    animateCell(row, col);
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }
  }, [board, turn, humanMark, botEnabled, gameStatus, animateCell]);

  // ---------------------------------------------------------------
  // Reinicia o jogo completo
  // ---------------------------------------------------------------
  const handleResetGame = useCallback(() => {
    setBoard(makeEmptyBoard());
    setTurn("X");
    setIsBotProcessing(false);
    endNotifiedRef.current = null;
    
    // Reseta animações
    cellAnimations.forEach(row => {
      row.forEach(anim => anim.setValue(0));
    });
  }, [cellAnimations]);

  // ---------------------------------------------------------------
  // Confirmação para sair do jogo
  // ---------------------------------------------------------------
  const handleExitConfirmation = useCallback(() => {
    Alert.alert(
      "Sair do Jogo",
      "Tens a certeza que queres sair? O progresso atual será perdido.",
      [
        { 
          text: "Continuar a Jogar", 
          style: "cancel" 
        },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: () => onExit?.() 
        },
      ]
    );
  }, [onExit]);

  // ---------------------------------------------------------------
  // Renderização do estado atual do jogo
  // ---------------------------------------------------------------
  const renderGameStatus = useCallback(() => {
    if (gameStatus === "winner") {
      return (
        <Text style={[styles.statusText, { color: colors.success }]}>
          🎉 Vencedor: {winner} {botEnabled && winner === botMark ? "(Bot)" : ""}
        </Text>
      );
    }
    
    if (gameStatus === "draw") {
      return (
        <Text style={[styles.statusText, { color: colors.warning }]}>
          🤝 Empate!
        </Text>
      );
    }
    
    return (
      <Text style={[styles.statusText, { color: colors.text }]}>
        {isBotProcessing && turn === botMark ? "🤖 Bot a pensar..." : `Vez do: ${turn}`}
        {botEnabled && turn === botMark ? " (Bot)" : ""}
      </Text>
    );
  }, [gameStatus, winner, turn, botEnabled, botMark, colors, isBotProcessing]);

  // ---------------------------------------------------------------
  // Renderização do tabuleiro
  // ---------------------------------------------------------------
  const renderBoard = useCallback(() => {
    return (
      <View style={styles.boardContainer}>
        {board.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((cell, colIndex) => {
              const isDisabled = cell !== null || gameStatus !== "playing" || 
                               (botEnabled && turn !== humanMark);
              
              const scaleAnim = cellAnimations[rowIndex][colIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1]
              });

              return (
                <TouchableOpacity
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={[
                    styles.cell,
                    { 
                      borderColor: colors.border,
                      backgroundColor: cell ? colors.primary : colors.card,
                    },
                    isDisabled && styles.cellDisabled,
                  ]}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                  disabled={isDisabled}
                  accessibilityRole="button"
                  accessibilityLabel={
                    cell ? 
                    `Célula ${rowIndex + 1},${colIndex + 1} com ${cell}` : 
                    `Célula vazia ${rowIndex + 1},${colIndex + 1}`
                  }
                  accessibilityState={{ disabled: isDisabled }}
                >
                  <Animated.Text 
                    style={[
                      styles.cellText, 
                      { 
                        color: cell ? colors.card : colors.text,
                        transform: [{ scale: scaleAnim }]
                      }
                    ]}
                  >
                    {cell || ""}
                  </Animated.Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  }, [board, colors, gameStatus, botEnabled, turn, humanMark, cellAnimations, handleCellPress]);

  // ---------------------------------------------------------------
  // Renderização principal
  // ---------------------------------------------------------------
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Cabeçalho com título e informações */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>
        
        {botEnabled && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tu: {humanMark} • Bot: {botMark} • {botDifficulty}
          </Text>
        )}
      </View>

      {/* Estado do jogo */}
      <View style={styles.statusContainer}>
        {renderGameStatus()}
      </View>

      {/* Tabuleiro */}
      {renderBoard()}

      {/* Controlos */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleResetGame}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar jogo"
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>🔄 Reiniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.error, borderColor: colors.error }]}
          onPress={handleExitConfirmation}
          accessibilityRole="button"
          accessibilityLabel="Sair do jogo"
        >
          <Text style={[styles.buttonText, { color: colors.card }]}>🚪 Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------
// Estilos melhorados com melhor espaçamento e acessibilidade
// ---------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    marginVertical: 20,
    minHeight: 40,
    justifyContent: "center",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  boardContainer: {
    backgroundColor: "transparent",
    borderRadius: 12,
    padding: 8,
  },
  row: {
    flexDirection: "row",
  },
  cell: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cellDisabled: {
    opacity: 0.7,
  },
  cellText: {
    fontSize: 32,
    fontWeight: "900",
  },
  controls: {
    flexDirection: "row",
    gap: 16,
    marginTop: 30,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: "center",
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});