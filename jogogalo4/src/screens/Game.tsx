// src/screens/Game.tsx

// Importa React e hooks necessários
import React, { useState, useEffect, useMemo, useRef } from "react";
// Importa componentes do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
// Importa o tema global
import { useTheme } from "../theme/Theme";

// Define as props aceitas pelo componente de jogo
type Props = {
  onWin?: () => void;             // callback quando o humano vence
  onDraw?: () => void;            // callback quando há empate
  onLoss?: () => void;            // callback quando o humano perde (bot vence)
  onExit?: () => void;            // callback ao sair do jogo
  botEnabled?: boolean;           // ativa o bot no singleplayer
  botMark?: "X" | "O";            // símbolo usado pelo bot
  humanMark?: "X" | "O";          // símbolo do humano (opcional; se não vier é inferido)
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
  // Lista de todas as combinações vencedoras
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
  // Varre todas as linhas em busca de três iguais
  for (const [a, b1, c] of lines) {
    if (a && a === b1 && b1 === c) return a;
  }
  // Se não encontrou vencedor, retorna null
  return null;
}

// Função utilitária: estratégia simples do bot (primeira casa livre)
function chooseBotMove(board: (null | "X" | "O")[][]): [number, number] | null {
  // Percorre todas as células do tabuleiro
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      // Se a célula estiver vazia, retorna a posição
      if (board[r][c] === null) return [r, c];
    }
  }
  // Se não houver células livres, retorna null
  return null;
}

// Componente principal do ecrã de jogo
export default function Game({
  onWin,
  onDraw,
  onLoss,
  onExit,
  botEnabled = false,   // por omissão o bot fica desligado
  botMark = "O",        // por omissão o bot joga como "O"
  humanMark,            // pode ser passado; se não vier, é inferido
}: Props) {
  // Obtém as cores do tema atual
  const { colors } = useTheme();

  // Estado do tabuleiro, sempre com valor inicial válido
  const [board, setBoard] = useState<(null | "X" | "O")[][]>(makeEmptyBoard());
  // Estado de quem tem a vez; por convenção, "X" começa
  const [turn, setTurn] = useState<"X" | "O">("X");

  // Resolução da marca do humano:
  // - se vier via prop, usa-a;
  // - senão, infere como o oposto do bot.
  const effectiveHumanMark: "X" | "O" =
    humanMark ?? (botMark === "X" ? "O" : "X");

  // Guarda refs para os callbacks, evitando loops por mudança de identidade
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);

  // Mantém as refs sincronizadas quando as props mudarem
  useEffect(() => { onWinRef.current  = onWin;  }, [onWin]);
  useEffect(() => { onDrawRef.current = onDraw; }, [onDraw]);
  useEffect(() => { onLossRef.current = onLoss; }, [onLoss]);

  // Estado derivado: vencedor atual e se o tabuleiro está completo
  const winner = useMemo(() => getWinner(board), [board]);
  const isFull = useMemo(
    () => board.every((row) => row.every((c) => c !== null)),
    [board]
  );

  // Efeito de término do jogo: depende apenas de winner e isFull
  useEffect(() => {
    if (winner === effectiveHumanMark) {
      onWinRef.current && onWinRef.current();
    } else if (winner === botMark) {
      onLossRef.current && onLossRef.current();
    } else if (!winner && isFull) {
      onDrawRef.current && onDrawRef.current();
    }
  }, [winner, isFull, effectiveHumanMark, botMark]);

  // Ref que evita que o bot tome decisões em duplicado enquanto aguarda timeout
  const botThinkingRef = useRef(false);

  // Efeito que executa a jogada do bot quando for a vez dele
  useEffect(() => {
    // Se o bot não estiver ativo, sai
    if (!botEnabled) return;
    // Se já terminou a partida, sai
    if (winner || isFull) return;
    // Se não for a vez do bot, sai
    if (turn !== botMark) return;
    // Se já existe um timeout pendente do bot, sai
    if (botThinkingRef.current) return;

    // Marca que o bot está a "pensar"
    botThinkingRef.current = true;

    // Cria um pequeno atraso para a jogada do bot
    const t = setTimeout(() => {
      // Escolhe uma jogada válida
      const move = chooseBotMove(board);
      if (move) {
        const [r, c] = move;                     // desestrutura linha e coluna
        const next = board.map((row) => row.slice()); // clona o tabuleiro
        if (next[r][c] === null) {               // valida célula livre
          next[r][c] = botMark;                  // marca jogada do bot
          setBoard(next);                        // atualiza estado
          setTurn(effectiveHumanMark);           // passa a vez ao humano
        }
      }
      // Liberta a flag de pensamento do bot
      botThinkingRef.current = false;
    }, 250);

    // Cleanup do timeout se o componente desmontar
    return () => clearTimeout(t);
  }, [botEnabled, turn, botMark, effectiveHumanMark, board, winner, isFull]);

  // Handler quando o humano toca numa célula
  const handleCell = (r: number, c: number) => {
    // Se já terminou a partida, ignora
    if (winner) return;
    // Se há bot e não é a vez do humano, ignora
    if (botEnabled && turn !== effectiveHumanMark) return;

    // Clona o tabuleiro para edição imutável
    const next = board.map((row) => row.slice());
    // Se a célula já estiver ocupada, ignora
    if (next[r][c] !== null) return;

    // Marca a jogada do humano
    next[r][c] = effectiveHumanMark;
    // Atualiza o tabuleiro
    setBoard(next);
    // Alterna o turno: se houver bot, passa para o bot; senão alterna normal
    setTurn(botEnabled ? botMark : (effectiveHumanMark === "X" ? "O" : "X"));
  };

  // Handler para reiniciar a partida
  const handleReset = () => {
    setBoard(makeEmptyBoard());  // recria tabuleiro vazio
    setTurn("X");                // por convenção, "X" começa
    botThinkingRef.current = false; // limpa flag do bot
  };

  // Handler para sair do jogo com confirmação
  const handleExit = () => {
    Alert.alert("Sair", "Queres sair do jogo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => onExit && onExit() },
    ]);
  };

  // Render do ecrã
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título do ecrã */}
      <Text style={[styles.title, { color: colors.text }]}>Jogo do Galo</Text>

      {/* Linha informativa com os papéis de cada um */}
      <Text style={[styles.roles, { color: colors.text }]}>
        Tu: {effectiveHumanMark}   •   Bot: {botMark}
      </Text>

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
                key={`${r}-${c}`}                               // chave única por célula
                style={[
                  styles.cell,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                onPress={() => handleCell(r, c)}                // trata o toque
              >
                <Text style={[styles.cellText, { color: colors.text }]}>
                  {cell ?? ""}                                  // mostra X, O ou vazio
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Botões de ação */}
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

// Estilos do ecrã
const styles = StyleSheet.create({
  container: {
    flex: 1,                       // ocupa ecrã todo
    padding: 16,                   // espaçamento interno
    alignItems: "center",          // centra horizontalmente
    justifyContent: "center",      // centra verticalmente
  },
  title: {
    fontSize: 22,                  // tamanho do título
    fontWeight: "700",             // destaque do título
    marginBottom: 4,               // espaço abaixo
  },
  roles: {
    fontSize: 14,                  // tamanho da linha "Tu/Bot"
    marginBottom: 8,               // espaço abaixo
  },
  info: {
    fontSize: 16,                  // tamanho da mensagem de estado
    marginBottom: 12,              // espaço abaixo
  },
  board: {
    // wrapper do tabuleiro
  },
  row: {
    flexDirection: "row",          // três células lado a lado
  },
  cell: {
    width: 84,                     // largura da célula
    height: 84,                    // altura da célula
    borderWidth: 1,                // borda visível
    alignItems: "center",          // centra conteúdo na horizontal
    justifyContent: "center",      // centra conteúdo na vertical
    margin: 2,                     // espaço entre células
    borderRadius: 10,              // cantos arredondados
  },
  cellText: {
    fontSize: 28,                  // tamanho do X/O
    fontWeight: "800",             // peso do X/O
  },
  actions: {
    flexDirection: "row",          // botões lado a lado
    marginTop: 24,                 // espaço acima dos botões
    gap: 12,                       // espaço entre botões
  },
  button: {
    borderWidth: 1,                // borda do botão
    borderRadius: 10,              // cantos arredondados
    paddingHorizontal: 16,         // espaçamento horizontal interno
    paddingVertical: 10,           // espaçamento vertical interno
  },
  buttonText: {
    fontSize: 14,                  // tamanho do texto do botão
    fontWeight: "700",             // peso do texto do botão
  },
});
