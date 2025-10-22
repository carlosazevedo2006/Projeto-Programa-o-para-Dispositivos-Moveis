// src/screens/Game.tsx

// Importa React e hooks de estado/efeitos/memoização/refs
import React, { useState, useEffect, useMemo, useRef } from "react";
// Importa componentes base do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// Importa o tema global (para cores coerentes com modo claro/escuro)
import { useTheme } from "../theme/Theme";

// Importa tipos e utilitários do tabuleiro
import { Board, makeEmptyBoard, isBoardFull, cloneBoard } from "../utils/board";
// Importa a lógica do bot (inclui getWinner)
import { BotDifficulty, chooseBotMoveByDifficulty, getWinner } from "../ai/bot";

// Define as props aceites pelo ecrã de jogo
type Props = {
  onWin?: () => void;                             // callback quando o humano vence (single)
  onDraw?: () => void;                            // callback quando há empate
  onLoss?: () => void;                            // callback quando o humano perde (single)
  onExit?: () => void;                            // callback ao sair do jogo
  onGameEnd?: (winner: "X" | "O" | null) => void; // callback genérico no fim do jogo
  botEnabled?: boolean;                           // ativa/desativa bot (single vs multi)
  botMark?: "X" | "O";                            // símbolo usado pelo bot
  humanMark?: "X" | "O";                          // símbolo do humano
  botDifficulty?: BotDifficulty;                  // dificuldade do bot: easy | medium | hard
};

// Componente principal do jogo
export default function Game({
  onWin,
  onDraw,
  onLoss,
  onExit,
  onGameEnd,
  botEnabled = false,      // por omissão, sem bot (modo multi)
  botMark = "O",           // por omissão bot é "O"
  humanMark = "X",         // por omissão humano é "X"
  botDifficulty = "medium" // dificuldade padrão
}: Props) {
  // Acede às cores do tema atual
  const { colors } = useTheme();

  // Estado do tabuleiro (3x3)
  const [board, setBoard] = useState<Board>(makeEmptyBoard());
  // Estado do turno (por convenção, "X" começa)
  const [turn, setTurn] = useState<"X" | "O">("X");

  // Refs para manter identidades estáveis dos callbacks e evitar re-render loops
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);
  const onGameEndRef = useRef(onGameEnd);

  // Mantém as refs sincronizadas quando as props mudam
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);

  // Calcula vencedor atual e se o tabuleiro está cheio (derivados do estado)
  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(() => isBoardFull(board), [board]);

  // Guarda o último estado final notificado para não duplicar eventos de fim
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null);

  // Efeito: quando a partida termina, notifica uma única vez
  useEffect(() => {
    // Se ainda não terminou, limpa a marca e sai
    if (!winner && !isFull) {
      endNotifiedRef.current = null;
      return;
    }

    // Cria chave do estado final (vencedor ou empate)
    const endKey: "X" | "O" | "draw" = winner ? winner : "draw";
    // Evita notificação duplicada do mesmo fim
    if (endNotifiedRef.current === endKey) return;
    endNotifiedRef.current = endKey;

    // Notifica o App com o símbolo vencedor (ou null no empate)
    onGameEndRef.current?.(winner ?? null);

    // Callbacks de estatísticas (mantidos para singleplayer)
    if (winner === humanMark) onWinRef.current?.();
    else if (winner === botMark) onLossRef.current?.();
    else if (!winner) onDrawRef.current?.();
  }, [winner, isFull, humanMark, botMark]);

  // Flag para impedir múltiplas jogadas do bot durante o timeout
  const botThinkingRef = useRef(false);

  // Efeito: executa a jogada do bot quando é a vez dele
  useEffect(() => {
    // Guarda de segurança: só prossegue se todas as condições permitirem
    if (!botEnabled || winner || isFull || turn !== botMark || botThinkingRef.current) return;

    // Marca que o bot está a "pensar" para não duplicar timeouts
    botThinkingRef.current = true;

    // Tipagem segura do setTimeout (evita sublinhado em TS com Node/DOM)
    const t: ReturnType<typeof setTimeout> = setTimeout(() => {
      // Escolhe a jogada consoante a dificuldade e marcas atuais
      const move = chooseBotMoveByDifficulty(board, botDifficulty, botMark, humanMark);

      // Se existir jogada válida, aplica-a
      if (move) {
        const [r, c] = move;
        const next = cloneBoard(board);  // clona o tabuleiro de forma imutável
        if (next[r][c] === null) {      // confirma que a célula ainda está livre
          next[r][c] = botMark;         // coloca a marca do bot
          setBoard(next);               // atualiza o tabuleiro
          setTurn(humanMark);           // passa a vez para o humano
        }
      }

      // Liberta a flag depois da jogada
      botThinkingRef.current = false;
    }, 250); // pequeno atraso para melhor UX

    // Cleanup do timeout quando o efeito é refeito/unmount (tipagem segura)
    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, humanMark, board, winner, isFull, botDifficulty]);

  // Handler: humano toca numa célula
  const handleCell = (r: number, c: number) => {
    // Ignora se a partida já terminou
    if (winner) return;
    // Com bot ativo, só deixa jogar se for a vez do humano
    if (botEnabled && turn !== humanMark) return;

    // Clona o tabuleiro para atualização imutável
    const next = cloneBoard(board);
    // Se a célula está ocupada, não faz nada
    if (next[r][c] !== null) return;

    // Coloca a marca do jogador da vez
    next[r][c] = turn;
    // Atualiza o estado com o novo tabuleiro
    setBoard(next);
    // Alterna o turno
    setTurn(turn === "X" ? "O" : "X");
  };

  // Reinicia a partida (tabuleiro limpo e "X" começa)
  const handleReset = () => {
    setBoard(makeEmptyBoard());   // volta a criar 3x3 vazio
    setTurn("X");                 // por convenção, "X" começa
    botThinkingRef.current = false; // limpa flag do bot
    endNotifiedRef.current = null;  // limpa marca de fim anterior
  };

  // Pede confirmação para sair para o menu
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },                        // cancela e fica no jogo
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() }, // confirma saída
    ]);
  };

  // Render
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título do ecrã */}
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {/* Linha informativa quando o bot está ativo: papéis e dificuldade */}
      {botEnabled && (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {humanMark}   •   Bot: {botMark}   •   Dificuldade: {botDifficulty}
        </Text>
      )}

      {/* Mensagens de estado: vez, vencedor ou empate */}
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
                key={`${r}-${c}`} // chave única por célula
                style={[
                  styles.cell,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={() => handleCell(r, c)} // trata toque na célula
              >
                <Text style={[styles.cellText, { color: colors.text }]}>
                  {cell ?? ""} // mostra "X", "O" ou vazio
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

        {/* margem esquerda manual para substituir o antigo gap */}
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

// Estilos do ecrã
const styles = StyleSheet.create({
  // Container raiz do ecrã
  container: {
    flex: 1,                // ocupa a altura toda
    padding: 16,            // espaço interno
    alignItems: "center",   // centra horizontalmente
    justifyContent: "center", // centra verticalmente
  },
  // Título do ecrã
  title: {
    fontSize: 22,           // tamanho do texto
    fontWeight: "700",      // negrito para destaque
    marginBottom: 4,        // espaço abaixo
  },
  // Linha com papéis e dificuldade
  roles: {
    fontSize: 14,           // tamanho do texto
    marginBottom: 8,        // espaço abaixo
  },
  // Mensagens de estado (vez/vencedor/empate)
  info: {
    fontSize: 16,           // tamanho do texto
    marginBottom: 12,       // espaço abaixo
  },
  // Área do tabuleiro
  board: {
    // deixado vazio de propósito (podes ajustar se precisares)
  },
  // Linha de células
  row: {
    flexDirection: "row",   // três células lado a lado
  },
  // Célula individual
  cell: {
    width: 84,              // largura
    height: 84,             // altura
    borderWidth: 1,         // borda visível
    alignItems: "center",   // centra conteúdo horizontalmente
    justifyContent: "center", // centra verticalmente
    margin: 2,              // espaçamento entre células
    borderRadius: 10,       // cantos arredondados
  },
  // Texto dentro da célula (X/O)
  cellText: {
    fontSize: 28,           // tamanho grande
    fontWeight: "800",      // peso forte
  },
  // Linha de botões inferiores
  actions: {
    flexDirection: "row",   // botões lado a lado
    marginTop: 24,          // espaço acima
    // sem 'gap' para evitar sublinhado em typings RN antigos
  },
  // Botão base
  button: {
    borderWidth: 1,         // borda
    borderRadius: 10,       // cantos
    paddingHorizontal: 16,  // espaço interno lateral
    paddingVertical: 10,    // espaço interno vertical
  },
  // Texto dos botões
  buttonText: {
    fontSize: 14,           // tamanho
    fontWeight: "700",      // destaque
  },
});
