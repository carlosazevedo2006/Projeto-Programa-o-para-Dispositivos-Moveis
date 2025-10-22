// src/screens/Game.tsx

// Importa React e hooks
import React, { useState, useEffect, useMemo, useRef } from "react"; // hooks para estado, efeitos e memorização
// Importa componentes base do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native"; // UI e alertas
// Importa o tema global
import { useTheme } from "../theme/Theme"; // hook para paleta de cores
// Importa a IA do bot já separada
import {
  BotDifficulty,           // tipo de dificuldade
  Board,                   // tipo de tabuleiro
  chooseBotMoveByDifficulty,// escolhe jogada pela dificuldade
  getWinner,               // calcula vencedor
} from "../ai/bot";        // módulo do bot

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
  botDifficulty?: BotDifficulty;                  // dificuldade do bot
};

// Cria um tabuleiro 3x3 vazio
const makeEmptyBoard = () =>
  [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ] as Board; // usa o tipo Board do módulo do bot

// Componente principal do jogo
export default function Game({
  onWin,                         // callback de vitória do humano (single)
  onDraw,                        // callback de empate (single e multi)
  onLoss,                        // callback de derrota do humano (single)
  onExit,                        // callback para sair do jogo
  onGameEnd,                     // callback genérico de fim de jogo (símbolo vencedor ou null)
  botEnabled = false,            // liga/desliga bot
  botMark = "O",                 // símbolo do bot
  humanMark = "X",               // símbolo do humano
  botDifficulty = "medium",      // dificuldade do bot
}: Props) {
  // Usa a paleta de cores do tema atual
  const { colors } = useTheme(); // recebe as cores

  // Estado do tabuleiro
  const [board, setBoard] = useState<Board>(makeEmptyBoard()); // estado 3x3
  // Estado de quem tem a vez (X começa por convenção)
  const [turn, setTurn] = useState<"X" | "O">("X"); // "X" começa sempre

  // Resolve quem é o humano e o bot
  const effectiveHumanMark: "X" | "O" = humanMark;  // símbolo do humano
  const effectiveBotMark: "X" | "O" = botMark;      // símbolo do bot

  // Refs para callbacks, para evitar re-trigger por mudança de identidade
  const onWinRef = useRef(onWin);                 // referência onWin
  const onDrawRef = useRef(onDraw);               // referência onDraw
  const onLossRef = useRef(onLoss);               // referência onLoss
  const onGameEndRef = useRef(onGameEnd);         // referência onGameEnd

  // Mantém as refs sincronizadas quando as props mudarem
  useEffect(() => { onWinRef.current = onWin; }, [onWin]);               // sincroniza onWin
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);            // sincroniza onDraw
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);            // sincroniza onLoss
  useEffect(() => { onGameEndRef.current = onGameEnd; }, [onGameEnd]);   // sincroniza onGameEnd

  // Calcula o vencedor atual do tabuleiro
  const winner = useMemo(() => getWinner(board), [board]);               // vencedor derivado
  // Verifica se o tabuleiro está cheio
  const isFull = useMemo(() => board.every(row => row.every(c => c !== null)), [board]); // cheio?

  // Evita notificar o fim várias vezes
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null); // último fim notificado

  // Efeito: trata o fim do jogo (vitória, derrota ou empate)
  useEffect(() => {
    // Se ainda não acabou, limpa a marca e sai
    if (!winner && !isFull) {
      endNotifiedRef.current = null; // limpa
      return;                        // sai
    }

    // Chave única do fim: símbolo vencedor ou "draw"
    const endKey: "X" | "O" | "draw" = winner ? winner : "draw"; // chave do estado final
    // Se já notificou este resultado, não repete
    if (endNotifiedRef.current === endKey) return; // evita duplicado
    // Marca como notificado
    endNotifiedRef.current = endKey;

    // Notifica o App com o símbolo vencedor (ou null no empate)
    if (onGameEndRef.current) onGameEndRef.current(winner ?? null); // chama onGameEnd

    // Callbacks legacy para estatísticas em singleplayer
    if (winner === effectiveHumanMark) {
      onWinRef.current && onWinRef.current();   // humano venceu
    } else if (winner === effectiveBotMark) {
      onLossRef.current && onLossRef.current(); // humano perdeu
    } else if (!winner) {
      onDrawRef.current && onDrawRef.current(); // empate
    }
  }, [winner, isFull, effectiveHumanMark, effectiveBotMark]); // dependências mínimas

  // Flag para impedir que o bot jogue múltiplas vezes durante o timeout
  const botThinkingRef = useRef(false); // controla execução do bot

  // Efeito: faz o bot jogar quando é a vez dele
  useEffect(() => {
    // Sem bot ativo, não faz nada
    if (!botEnabled) return;
    // Se o jogo já terminou, não faz nada
    if (winner || isFull) return;
    // Se não é a vez do bot, não faz nada
    if (turn !== botMark) return;
    // Se já há uma jogada pendente, não faz nada
    if (botThinkingRef.current) return;

    // Marca que o bot está "a pensar"
    botThinkingRef.current = true;

    // Pequeno atraso para fluidez da jogada do bot
    const t = setTimeout(() => {
      // Pede ao módulo do bot a melhor jogada para a dificuldade atual
      const move = chooseBotMoveByDifficulty(board, botDifficulty, effectiveBotMark, effectiveHumanMark);
      // Se existe jogada válida
      if (move) {
        const [r, c] = move;                        // extrai coordenadas
        const next = board.map(row => row.slice()); // clona o tabuleiro
        if (next[r][c] === null) {                  // confere que está livre
          next[r][c] = botMark;                     // coloca a peça do bot
          setBoard(next);                           // aplica novo estado
          setTurn(humanMark);                       // passa a vez ao humano
        }
      }
      // Liberta a flag de pensamento
      botThinkingRef.current = false;
    }, 250); // atraso de 250 ms

    // Cleanup do timeout caso o componente desmonte
    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, humanMark, board, winner, isFull, botDifficulty, effectiveBotMark, effectiveHumanMark]); // dependências

  // Handler: humano toca numa célula
  const handleCell = (r: number, c: number) => {
    // Ignora se já terminou
    if (winner) return;
    // Se há bot e não é a vez do humano, ignora
    if (botEnabled && turn !== humanMark) return;

    // Clona o tabuleiro
    const next = board.map(row => row.slice());
    // Se a célula estiver ocupada, ignora
    if (next[r][c] !== null) return;

    // Marca a jogada com o símbolo do turno atual
    next[r][c] = turn;
    // Atualiza o estado do tabuleiro
    setBoard(next);
    // Alterna o turno para o próximo símbolo
    setTurn(turn === "X" ? "O" : "X");
  };

  // Reinicia a partida com tabuleiro vazio
  const handleReset = () => {
    setBoard(makeEmptyBoard());        // cria novo tabuleiro vazio
    setTurn("X");                      // X começa por convenção
    botThinkingRef.current = false;    // limpa flag do bot
    endNotifiedRef.current = null;     // limpa marca de fim anterior
  };

  // Sair do jogo com confirmação
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },                              // não sai
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() }, // confirma saída
    ]);
  };

  // Renderização do ecrã
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título principal */}
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {/* Informações de papéis e dificuldade quando o bot está ativo */}
      {botEnabled && (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {effectiveHumanMark}   •   Bot: {effectiveBotMark}   •   Dificuldade: {botDifficulty}
        </Text>
      )}

      {/* Mensagem de estado: vez, vencedor ou empate */}
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
                key={`${r}-${c}`}                                                              // chave por célula
                style={[
                  styles.cell,                                                                  // estilo base
                  { borderColor: colors.border, backgroundColor: colors.card },                // cores do tema
                ]}
                onPress={() => handleCell(r, c)}                                               // trata toque
              >
                <Text style={[styles.cellText, { color: colors.text }]}>
                  {cell ?? ""}                                                                 // mostra X, O ou vazio
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Botões de ação */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]} // botão reiniciar
          onPress={handleReset}                                                                 // reinicia partida
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Reiniciar</Text>            {/* rótulo */}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]} // botão sair
          onPress={handleExit}                                                                  // confirma saída
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Sair</Text>                 {/* rótulo */}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos do ecrã
const styles = StyleSheet.create({
  container: {
    flex: 1,                          // ocupa ecrã inteiro
    padding: 16,                      // espaçamento interno
    alignItems: "center",             // centra horizontalmente
    justifyContent: "center",         // centra verticalmente
  },
  title: {
    fontSize: 22,                     // tamanho do título
    fontWeight: "700",                // destaque
    marginBottom: 4,                  // espaço abaixo
  },
  roles: {
    fontSize: 14,                     // tamanho do texto
    marginBottom: 8,                  // espaço abaixo
  },
  info: {
    fontSize: 16,                     // tamanho da mensagem
    marginBottom: 12,                 // espaço abaixo
  },
  board: {                            // wrapper do tabuleiro
  },
  row: {
    flexDirection: "row",             // três células lado a lado
  },
  cell: {
    width: 84,                        // largura da célula
    height: 84,                       // altura da célula
    borderWidth: 1,                   // borda visível
    alignItems: "center",             // centra conteúdo
    justifyContent: "center",         // centra conteúdo
    margin: 2,                        // espaço entre células
    borderRadius: 10,                 // cantos arredondados
  },
  cellText: {
    fontSize: 28,                     // tamanho do X/O
    fontWeight: "800",                // peso do X/O
  },
  actions: {
    flexDirection: "row",             // botões lado a lado
    marginTop: 24,                    // espaço acima
    gap: 12,                          // espaço entre botões
  },
  button: {
    borderWidth: 1,                   // borda
    borderRadius: 10,                 // cantos arredondados
    paddingHorizontal: 16,            // espaçamento interno horizontal
    paddingVertical: 10,              // espaçamento interno vertical
  },
  buttonText: {
    fontSize: 14,                     // tamanho do texto
    fontWeight: "700",                // destaque
  },
});
