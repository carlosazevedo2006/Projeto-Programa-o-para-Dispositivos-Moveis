// src/screens/Game.tsx
// =============================================================
// ECRÃ PRINCIPAL DO JOGO - LÓGICA DO JOGO DO GALO
// =============================================================

// Importa React e todos os hooks necessários
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
// Importa componentes do React Native
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,    // ✅ CORREÇÃO: Importar Platform para detetar o SO
  Vibration    // ✅ CORREÇÃO: Importar Vibration para feedback tátil
} from "react-native";
// Importa o sistema de temas para cores consistentes
import { useTheme } from "../theme/Theme";
// Importa tipos e funções auxiliares do tabuleiro
import { Board, makeEmptyBoard, isBoardFull, cloneBoard } from "../utils/board";
// Importa lógica do bot e função de verificação do vencedor
import { BotDifficulty, chooseBotMoveByDifficulty, getWinner } from "../ai/bot";

// =============================================================
// DEFINIÇÃO DAS PROPRIEDADES DO COMPONENTE
// =============================================================
type Props = {
  onWin?: () => void;                             // Callback para vitória do jogador humano
  onDraw?: () => void;                            // Callback para empate
  onLoss?: () => void;                            // Callback para derrota do jogador humano
  onExit?: () => void;                            // Callback para sair do jogo
  onGameEnd?: (winner: "X" | "O" | null) => void; // Callback genérico para fim de jogo
  botEnabled?: boolean;                           // Flag para modo singleplayer (vs bot)
  botMark?: "X" | "O";                            // Símbolo do bot
  humanMark?: "X" | "O";                          // Símbolo do jogador humano
  botDifficulty?: BotDifficulty;                  // Dificuldade do bot
};

// =============================================================
// COMPONENTE PRINCIPAL - GAME SCREEN
// =============================================================
export default function Game({
  // Valores padrão para props opcionais
  onWin,
  onDraw,
  onLoss,
  onExit,
  onGameEnd,
  botEnabled = false,           // Por padrão, modo multiplayer
  botMark = "O",                // Por padrão, bot é O
  humanMark = "X",              // Por padrão, humano é X
  botDifficulty = "Medio",      // Por padrão, dificuldade média
}: Props) {
  // =============================================================
  // HOOKS E ESTADOS
  // =============================================================
  
  // Obtém as cores do tema atual
  const { colors } = useTheme();

  // Estado do tabuleiro (matriz 3x3)
  const [board, setBoard] = useState<Board>(makeEmptyBoard());
  
  // Estado do turno atual ("X" ou "O")
  const [turn, setTurn] = useState<"X" | "O">("X");

  // =============================================================
  // REFS PARA CALLBACKS (evitam loops de renderização)
  // =============================================================
  
  // ✅ CORREÇÃO: useRef para callbacks que não devem causar re-renders
  const onWinRef = useRef(onWin);
  const onDrawRef = useRef(onDraw);
  const onLossRef = useRef(onLoss);
  const onGameEndRef = useRef(onGameEnd);

  // =============================================================
  // EFFECTS PARA SINCRONIZAÇÃO DE REFS
  // =============================================================
  
  // ✅ CORREÇÃO: Atualizar refs quando props mudam (sem causar re-render)
  useEffect(() => { 
    onWinRef.current = onWin; 
  }, [onWin]);

  useEffect(() => { 
    onDrawRef.current = onDraw; 
  }, [onDraw]);

  useEffect(() => { 
    onLossRef.current = onLoss; 
  }, [onLoss]);

  useEffect(() => { 
    onGameEndRef.current = onGameEnd; 
  }, [onGameEnd]);

  // =============================================================
  // MEMOIZED VALUES (valores calculados com useMemo para performance)
  // =============================================================
  
  // ✅ CORREÇÃO: useMemo para calcular o vencedor (evita cálculos desnecessários)
  const winner = useMemo(() => getWinner(board), [board]);
  
  // ✅ CORREÇÃO: useMemo para verificar se o tabuleiro está cheio
  const isFull = useMemo(() => isBoardFull(board), [board]);

  // =============================================================
  // REFS PARA CONTROLO DE ESTADO INTERNO (não causam re-renders)
  // =============================================================
  
  // Controla se já foi notificado o fim do jogo (evita notificações duplicadas)
  const endNotifiedRef = useRef<null | "X" | "O" | "draw">(null);
  
  // Controla se o bot está atualmente a "pensar" (evita jogadas múltiplas)
  const botThinkingRef = useRef(false);

  // =============================================================
  // EFFECT PRINCIPAL - GESTÃO DO FIM DO JOGO
  // =============================================================
  
  /**
   * Effect que trata do fim do jogo (vitória/empate)
   * CORREÇÃO: Dependências mínimas e estáveis
   */
  useEffect(() => {
    // Se o jogo ainda não terminou, limpa o estado de notificação e sai
    if (!winner && !isFull) {
      endNotifiedRef.current = null;
      return;
    }

    // Cria uma chave única para o resultado atual
    const endKey: "X" | "O" | "draw" = winner ? winner : "draw";

    // Se já foi notificado este mesmo resultado, ignora (evita duplicados)
    if (endNotifiedRef.current === endKey) return;
    
    // Marca que este resultado já foi notificado
    endNotifiedRef.current = endKey;

    // Notifica o componente pai sobre o fim do jogo
    onGameEndRef.current?.(winner ?? null);

    // Atualiza estatísticas conforme o resultado
    if (winner === humanMark) {
      // Jogador humano venceu
      onWinRef.current?.();
      
      // CORREÇÃO: Feedback tátil de vitória (apenas em mobile)
      if (Platform && Platform.OS !== 'web') {
        Vibration.vibrate([0, 100, 50, 100]); // Padrão: vibra-curto-pausa-vibra-curto
      }
    } else if (winner === botMark) {
      // Bot venceu (derrota do humano)
      onLossRef.current?.();
      
      // CORREÇÃO: Feedback tátil de derrota (apenas em mobile)
      if (Platform && Platform.OS !== 'web') {
        Vibration.vibrate(200); // Vibração longa
      }
    } else if (!winner) {
      // Empate
      onDrawRef.current?.();
      
      // CORREÇÃO: Feedback tátil de empate (apenas em mobile)
      if (Platform && Platform.OS !== 'web') {
        Vibration.vibrate(100); // Vibração média
      }
    }
  }, [winner, isFull, humanMark, botMark]); // ✅ Dependências estáveis

  // =============================================================
  // EFFECT DO BOT - LÓGICA DE JOGADA AUTOMÁTICA
  // =============================================================
  
  /**
   * Effect que controla as jogadas do bot
   * ✅ CORREÇÃO CRÍTICA: Condições de saída claras e cleanup adequado
   */
  useEffect(() => {
    // =============================================================
    // CONDIÇÕES DE SAÍDA ANTECIPADA
    // =============================================================
    
    // 1. Se o bot não está ativado, sai
    if (!botEnabled) return;
    
    // 2. Se o jogo já terminou (vencedor ou empate), sai
    if (winner || isFull) return;
    
    // 3. Se não é a vez do bot, sai
    if (turn !== botMark) return;
    
    // 4. Se o bot já está a processar uma jogada, sai
    if (botThinkingRef.current) return;

    // =============================================================
    // LÓGICA DE JOGADA DO BOT
    // =============================================================
    
    // Marca que o bot começou a processar
    botThinkingRef.current = true;

    // Cria um timeout para simular "pensamento" do bot
    const timer = setTimeout(() => {
      try {
        // Pede ao bot uma jogada baseada na dificuldade atual
        const move = chooseBotMoveByDifficulty(
          board, 
          botDifficulty, 
          botMark, 
          humanMark
        );

        // Se o bot encontrou uma jogada válida
        if (move) {
          const [row, col] = move; // Desestrutura as coordenadas
          const newBoard = cloneBoard(board); // Cria cópia do tabuleiro
          
          // Verifica se a célula ainda está vazia (double-check)
          if (newBoard[row][col] === null) {
            newBoard[row][col] = botMark; // Faz a jogada do bot
            setBoard(newBoard);           // Atualiza o estado do tabuleiro
            setTurn(humanMark);           // Passa a vez para o jogador humano
          }
        }
      } catch (error) {
        // ✅ CORREÇÃO: Captura erros para evitar crashes
        console.error("Erro na jogada do bot:", error);
      } finally {
        // ✅ CORREÇÃO CRÍTICA: Garante que o bot é libertado mesmo com erro
        botThinkingRef.current = false;
      }
    }, 350); // Delay de 350ms para parecer mais natural

    // =============================================================
    // CLEANUP FUNCTION (executada quando o effect é limpo)
    // =============================================================
    return () => {
      clearTimeout(timer); // Cancela o timeout se o component desmontar
      botThinkingRef.current = false; // Garante que o bot é libertado
    };
  }, [
    botEnabled,     // Quando o modo bot é ativado/desativado
    turn,           // Quando o turno muda
    board,          // Quando o tabuleiro muda (necessário para o bot)
    winner,         // Quando há um vencedor
    isFull,         // Quando o tabuleiro enche
    botDifficulty,  // Quando a dificuldade muda
    botMark,        // Quando o símbolo do bot muda
    humanMark       // Quando o símbolo do humano muda
  ]);

  // =============================================================
  // FUNÇÕES DE MANIPULAÇÃO (useCallback para performance)
  // =============================================================

  /**
   * Manipula o toque do jogador numa célula do tabuleiro
   * @param row - Linha da célula (0-2)
   * @param col - Coluna da célula (0-2)
   */
  const handleCellPress = useCallback((row: number, col: number) => {
    // =============================================================
    // VALIDAÇÕES DE ESTADO DO JOGO
    // =============================================================
    
    // 1. Se já há um vencedor, ignora o toque
    if (winner) return;
    
    // 2. Em modo bot, se não é a vez do humano, ignora
    if (botEnabled && turn !== humanMark) return;
    
    // 3. Se a célula já está ocupada, ignora
    if (board[row][col] !== null) return;

    // =============================================================
    // EXECUÇÃO DA JOGADA
    // =============================================================
    
    const newBoard = cloneBoard(board); // Cria cópia do tabuleiro
    newBoard[row][col] = turn;          // Marca a jogada do jogador atual
    
    setBoard(newBoard);                 // Atualiza o estado do tabuleiro
    setTurn(turn === "X" ? "O" : "X");  // Alterna o turno

    // ✅ CORREÇÃO: Feedback tátil para jogada (apenas em mobile)
    if (Platform && Platform.OS !== 'web') {
      Vibration.vibrate(50); // Vibração curta
    }
  }, [board, turn, humanMark, botEnabled, winner]); // Dependências estáveis

  /**
   * Reinicia o jogo para o estado inicial
   */
  const handleResetGame = useCallback(() => {
    setBoard(makeEmptyBoard());     // Tabuleiro vazio
    setTurn("X");                   // X começa sempre
    botThinkingRef.current = false; // Liberta o bot
    endNotifiedRef.current = null;  // Reseta notificações
  }, []); // Nenhuma dependência - função estável

  /**
   * Mostra confirmação para sair do jogo
   */
  const handleExitGame = useCallback(() => {
    Alert.alert(
      "Sair do Jogo",           // Título
      "Queres sair do jogo?",   // Mensagem
      [
        { 
          text: "Cancelar", 
          style: "cancel"       // Botão neutro
        },
        { 
          text: "Sair", 
          style: "destructive", // Botão de ação perigosa
          onPress: () => onExit?.() // Executa callback se fornecido
        },
      ]
    );
  }, [onExit]); // Dependência estável

  // =============================================================
  // RENDERIZAÇÃO PRINCIPAL DO COMPONENTE
  // =============================================================
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* ========================================================= */}
      {/* CABEÇALHO - TÍTULO E INFORMAÇÕES */}
      {/* ========================================================= */}
      <Text style={[styles.title, { color: colors.text }]}>
        Jogo do Galo
      </Text>

      {/* Informações de configuração (apenas em modo bot) */}
      {botEnabled && (
        <Text style={[styles.roles, { color: colors.text }]}>
          Tu: {humanMark} • Bot: {botMark} • Dificuldade: {botDifficulty}
        </Text>
      )}

      {/* ========================================================= */}
      {/* ESTATUTO DO JOGO */}
      {/* ========================================================= */}
      
      {/* Mensagem de vez/turno atual */}
      {!winner && !isFull && (
        <Text style={[styles.info, { color: colors.text }]}>
          Vez do: {turn} {botEnabled && turn === botMark ? "(bot)" : ""}
        </Text>
      )}
      
      {/* Mensagem de vitória */}
      {winner && (
        <Text style={[styles.info, { color: colors.text }]}>
          Vencedor: {winner} {botEnabled && winner === botMark ? "(bot)" : ""}
        </Text>
      )}
      
      {/* Mensagem de empate */}
      {!winner && isFull && (
        <Text style={[styles.info, { color: colors.text }]}>
          Empate
        </Text>
      )}

      {/* ========================================================= */}
      {/* TABULEIRO DO JOGO */}
      {/* ========================================================= */}
      <View style={styles.board}>
        {/* Mapeia cada linha do tabuleiro */}
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {/* Mapeia cada célula da linha */}
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`} // Chave única baseada em coordenadas
                style={[
                  styles.cell,
                  { 
                    borderColor: colors.border,     // Cor da borda do tema
                    backgroundColor: colors.card,   // Cor de fundo do tema
                  },
                ]}
                onPress={() => handleCellPress(rowIndex, colIndex)} // Handler de toque
              >
                {/* Texto da célula (X, O ou vazio) */}
                <Text style={[styles.cellText, { color: colors.text }]}>
                  {cell ?? ""} {/* Mostra célula ou string vazia */}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* ========================================================= */}
      {/* BOTÕES DE CONTROLO */}
      {/* ========================================================= */}
      <View style={styles.actions}>
        {/* Botão Reiniciar */}
        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: colors.card, 
            borderColor: colors.border 
          }]}
          onPress={handleResetGame} // Reinicia o jogo
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Reiniciar
          </Text>
        </TouchableOpacity>

        {/* Espaçamento entre botões */}
        <View style={{ width: 12 }} />

        {/* Botão Sair */}
        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: colors.card, 
            borderColor: colors.border 
          }]}
          onPress={handleExitGame} // Mostra confirmação de saída
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================================================
// ESTILOS DO COMPONENTE
// =============================================================
const styles = StyleSheet.create({
  // Container principal
  container: { 
    flex: 1,                    // Ocupa todo o espaço
    padding: 16,                // Espaçamento interno
    alignItems: "center",       // Centraliza horizontalmente
    justifyContent: "center",   // Centraliza verticalmente
  },
  // Título do jogo
  title: { 
    fontSize: 22,               // Tamanho grande
    fontWeight: "700",          // Negrito
    marginBottom: 4,            // Espaço abaixo
  },
  // Informações de configuração (modo bot)
  roles: { 
    fontSize: 14,               // Tamanho pequeno
    marginBottom: 8,            // Espaço abaixo
  },
  // Mensagens de status do jogo
  info: { 
    fontSize: 16,               // Tamanho médio
    marginBottom: 12,           // Espaço abaixo
  },
  // Container do tabuleiro
  board: {},
  // Linha do tabuleiro
  row: { 
    flexDirection: "row"        // Layout horizontal
  },
  // Célula individual do tabuleiro
  cell: {
    width: 84,                  // Largura fixa
    height: 84,                 // Altura fixa (quadrado)
    borderWidth: 1,             // Borda fina
    alignItems: "center",       // Centraliza conteúdo horizontalmente
    justifyContent: "center",   // Centraliza conteúdo verticalmente
    margin: 2,                  // Espaço entre células
    borderRadius: 10,           // Cantos arredondados
  },
  // Texto dentro da célula (X ou O)
  cellText: { 
    fontSize: 28,               // Tamanho grande
    fontWeight: "800",          // Negrito forte
  },
  // Container dos botões de ação
  actions: { 
    flexDirection: "row",       // Layout horizontal
    marginTop: 24,              // Espaço acima
  },
  // Botão genérico
  button: { 
    borderWidth: 1,             // Borda
    borderRadius: 10,           // Cantos arredondados
    paddingHorizontal: 16,      // Espaçamento horizontal interno
    paddingVertical: 10,        // Espaçamento vertical interno
  },
  // Texto do botão
  buttonText: { 
    fontSize: 14,               // Tamanho pequeno
    fontWeight: "700",          // Negrito
  },
});