// Importa React e hooks de estado e efeito
import React, { useState, useEffect } from "react";

// Importa componentes do React Native
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";

// Importa o algoritmo que calcula a jogada do bot
import { botMove } from "../utils/bot";

// Define o tipo das propriedades (props) recebidas do App
type GameProps = {
  players: string[];        // nomes dos jogadores → ["Jogador 1", "Jogador 2" ou "Bot"]
  isSingle: boolean;        // indica se o modo atual é single player
  darkMode: boolean;        // indica se o modo escuro está ativo
  onExit: () => void;       // função chamada ao sair do jogo
};

// Componente principal do ecrã do jogo
export default function Game({ players, isSingle, darkMode, onExit }: GameProps) {
  // Estado do tabuleiro (9 casas). Cada casa pode ser "X", "O" ou null
  const [board, setBoard] = useState<(null | "X" | "O")[]>(Array(9).fill(null));

  // Estado que indica o jogador atual (começa sempre com "X")
  const [current, setCurrent] = useState<"X" | "O">("X");

  // Estado que guarda o vencedor ("X", "O", "Empate" ou null)
  const [winner, setWinner] = useState<null | "X" | "O" | "Empate">(null);

  // Estado que indica se é o turno do bot (bloqueia cliques enquanto o bot joga)
  const [botTurn, setBotTurn] = useState(false);

  // Função que reinicia o jogo
  const resetGame = () => {
    setBoard(Array(9).fill(null)); // limpa o tabuleiro
    setCurrent("X");               // X começa
    setWinner(null);               // limpa o vencedor
    setBotTurn(false);             // desbloqueia bot
  };

  // Função que verifica se há vencedor no tabuleiro
  const checkWinner = (b: (null | "X" | "O")[]): "X" | "O" | "Empate" | null => {
    // Combinações vencedoras (linhas, colunas e diagonais)
    const wins = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    // Percorre todas as combinações e verifica se há 3 iguais
    for (const [a, b1, c] of wins) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }

    // Se todas as casas estiverem preenchidas e ninguém venceu → empate
    if (b.every((cell) => cell !== null)) return "Empate";

    // Caso contrário, o jogo continua
    return null;
  };

  // Efeito: se for modo single e for a vez do bot ("O"), ele joga automaticamente
  useEffect(() => {
    if (isSingle && current === "O" && !winner) {
      setBotTurn(true); // ativa bloqueio para impedir o jogador de clicar
      const timeout = setTimeout(() => {
        const move = botMove([...board]); // pede ao bot a melhor jogada
        if (move !== null) handlePress(move, true); // faz a jogada do bot
        setBotTurn(false); // desbloqueia jogadas humanas
      }, 600); // pequena pausa para parecer natural
      return () => clearTimeout(timeout);
    }
  }, [current, isSingle, board, winner]);

  // Função chamada quando o jogador toca numa célula
  const handlePress = (index: number, isBot: boolean = false) => {
    // Se já existe algo nessa célula, o jogo acabou, ou é turno do bot → ignora
    if (board[index] || winner || (isSingle && current === "O" && !isBot)) return;

    // Copia o estado atual do tabuleiro
    const newBoard = [...board];
    // Marca a jogada do jogador atual ("X" ou "O")
    newBoard[index] = current;
    // Atualiza o tabuleiro com a jogada
    setBoard(newBoard);

    // Verifica se alguém venceu
    const win = checkWinner(newBoard);
    if (win) {
      setWinner(win); // define o vencedor
    } else {
      // Alterna o turno: se era "X" passa para "O", e vice-versa
      setCurrent(current === "X" ? "O" : "X");
    }
  };

  // Cor de fundo e texto conforme o tema
  const backgroundColor = darkMode ? "#121212" : "#FFFFFF";
  const textColor = darkMode ? "#FFFFFF" : "#000000";
  const borderColor = darkMode ? "#FFFFFF" : "#000000";

  // Função que confirma antes de sair do jogo
  const confirmExit = () => {
    if (!winner) {
      Alert.alert(
        "Sair do jogo",
        "Tens a certeza que queres desistir e voltar ao menu?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sim", onPress: onExit },
        ]
      );
    } else {
      onExit();
    }
  };

  // Renderização da interface principal do jogo
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Barra superior com o botão de voltar */}
      <TouchableOpacity onPress={confirmExit} style={styles.backButton}>
        <Text style={[styles.backText, { color: textColor }]}>← Voltar</Text>
      </TouchableOpacity>

      {/* Título e estado do jogo */}
      <Text style={[styles.title, { color: textColor }]}>Jogo do Galo</Text>

      {/* Mensagem que mostra o estado atual (vez, vitória, empate) */}
      <Text style={[styles.status, { color: textColor }]}>
        {winner
          ? winner === "Empate"
            ? "Empate!"
            : `${winner === "X" ? players[0] : players[1]} venceu!`
          : botTurn
          ? "Bot a jogar..."
          : `É a vez de ${current === "X" ? players[0] : players[1]} (${current})`}
      </Text>

      {/* Tabuleiro 3x3 */}
      <View style={styles.board}>
        {board.map((cell, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.cell, { borderColor }]}
            onPress={() => handlePress(i)} // faz jogada se permitido
          >
            <Text style={[styles.cellText, { color: textColor }]}>{cell}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botões inferiores */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: "#6c757d" }]} onPress={resetGame}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: "#dc3545" }]} onPress={confirmExit}>
          <Text style={styles.buttonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos visuais do jogo
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa todo o ecrã
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap", // permite formar o 3x3
  },
  cell: {
    width: "33.33%", // 3 células por linha
    height: "33.33%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  cellText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 24,
  },
  button: {
    marginHorizontal: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
