// App.tsx

// Importa React e hooks essenciais
import React, { useState, useEffect, useCallback } from "react";
// Provider para áreas seguras (notch, barra de estado)
import { SafeAreaProvider } from "react-native-safe-area-context";
// Componentes básicos do React Native
import { View, StyleSheet } from "react-native";

// Telas do projeto
import SplashScreen from "./src/screens/SplashScreen";
import ModeSelect from "./src/screens/ModeSelect";
import SinglePlayer from "./src/screens/SinglePlayer";
import PlayerSelect from "./src/screens/PlayerSelect";
import Game from "./src/screens/Game";

// Componentes auxiliares
import SettingsButton from "./src/components/SettingsButton";
import SettingsModal from "./src/components/SettingsModal";
import ResultModal from "./src/components/ResultModal";

// Estatísticas persistidas e normalizadas
import StatsScreen, { loadStats, saveStats, Stats } from "./src/screens/StatsScreen";

// Tema global
import { ThemeProvider, useTheme } from "./src/theme/Theme";

// *** CORREÇÃO 1 (Importação de Tipo) ***
// Importa o tipo de dificuldade do bot a partir do ficheiro de IA (src/ai/bot.ts)
import type { BotDifficulty } from "./src/ai/bot"; //

// Alias para evitar conflitos de tipagem caso Game não declare todas as novas props
const GameComponent: any = Game;

// (O tipo local "easy" | "medium" | "hard" foi removido)

// Componente interno que consome o tema global
function AppInner() {
  // Estado de navegação simples por etapas
  const [stage, setStage] = useState<"splash" | "mode" | "single" | "multi" | "game" | "stats">("splash");
  // Estado do modal de definições
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Estado de estatísticas globais
  const [stats, setStats] = useState<Stats>({ wins: 0, draws: 0, losses: 0 });
  // Chave para forçar remontagem do Game
  const [gameKey, setGameKey] = useState(0);
  // Indica se o jogo atual é singleplayer
  const [isSingle, setIsSingle] = useState(false);
  // Símbolo escolhido pelo humano no singleplayer
  const [humanMark, setHumanMark] = useState<"X" | "O">("X");
  
  // *** CORREÇÃO 2 (Estado Inicial) ***
  // Usa o valor inicial correto "Medio" (com M maiúsculo) que corresponde ao tipo importado
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("Medio"); //

  // Estado do modal de resultado
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTitle, setResultTitle] = useState("");
  const [resultMessage, setResultMessage] = useState<string | undefined>(undefined);

  // Usa o tema global (cores e alternador)
  const { colors, toggleDarkMode } = useTheme();

  // Carrega estatísticas ao arrancar a aplicação
  useEffect(() => {
    (async () => {
      const s = await loadStats();
      await saveStats(s);
      setStats(s);
    })();
  }, []);

  // Persiste estatísticas sempre que mudarem
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Funções de incremento (useCallback para performance)
  const addWin = useCallback(() => {
    setStats((s) => ({ ...s, wins: (Number(s.wins) || 0) + 1 }));
  }, []);
  const addDraw = useCallback(() => {
    setStats((s) => ({ ...s, draws: (Number(s.draws) || 0) + 1 }));
  }, []);
  const addLoss = useCallback(() => {
    setStats((s) => ({ ...s, losses: (Number(s.losses) || 0) + 1 }));
  }, []);

  // Reinicia o jogo atual
  const resetGame = () => setGameKey((k) => k + 1);

  // Calcula a marca do bot
  const botMark: "X" | "O" = humanMark === "X" ? "O" : "X";

  // Mostra o resultado do jogo
  const showResult = (winner: "X" | "O" | null) => {
    if (isSingle) {
      // Caso singleplayer
      if (winner === null) {
        setResultTitle("Empate");
        setResultMessage(undefined);
      } else if (winner === humanMark) {
        setResultTitle("Ganhaste");
        setResultMessage("O bot perdeu");
      } else {
        setResultTitle("O bot ganhou");
        setResultMessage("Perdeste esta partida");
      }
      setResultOpen(true);
      return;
    }
    // Caso multiplayer
    if (winner === null) {
      setResultTitle("Empate");
      setResultMessage(undefined);
    } else if (winner === "X") {
      setResultTitle("Vitória do Jogador 1");
      setResultMessage("Jogador 2 perdeu");
    } else {
      setResultTitle("Vitória do Jogador 2");
      setResultMessage("Jogador 1 perdeu");
    }
    setResultOpen(true);
  };

  // Render principal do app
  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        
        {/* Ecrã Splash */}
        {stage === "splash" && (
          <SplashScreen onDone={() => setStage("mode")} />
        )}

        {/* Ecrã Seleção de Modo */}
        {stage === "mode" && (
          <ModeSelect
            onChoose={(mode) => {
              if (mode === "single") {
                setIsSingle(true);
                setStage("single");
              } else {
                setIsSingle(false);
                setStage("multi");
              }
            }}
          />
        )}

        {/* Ecrã Configuração Single Player */}
        {stage === "single" && (
          <SinglePlayer
            onChoose={(payload) => {
              setHumanMark(payload.mark);
              setBotDifficulty(payload.difficulty);
              setStage("game");
            }}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Ecrã Configuração Multi Player */}
        {stage === "multi" && (
          <PlayerSelect
            onStart={() => setStage("game")}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Ecrã de Jogo */}
        {stage === "game" && (
          <GameComponent
            key={gameKey}
            onWin={addWin}
            onDraw={addDraw}
            onLoss={addLoss}
            onExit={() => setStage("mode")}
            botEnabled={isSingle}
            botMark={botMark}
            humanMark={humanMark}
            botDifficulty={botDifficulty}
            onGameEnd={showResult}
          />
        )}

        {/* Ecrã de Estatísticas */}
        {stage === "stats" && (
          <StatsScreen onBack={() => setStage("mode")} />
        )}

        {/* *** CORREÇÃO 3 (O ERRO PRINCIPAL) ***
            Passa a função () => setSettingsOpen(true) 
            em vez de executar setSettingsOpen(true)
        */}
        <SettingsButton onPress={() => setSettingsOpen(true)} />

        {/* Modal de Definições */}
        <SettingsModal
          visible={settingsOpen}
          onClose={() => setSettingsOpen(false)} // Esta função agora vai funcionar
          onToggleTheme={toggleDarkMode}
          onResetGame={() => {
            setSettingsOpen(false); // Fecha o modal
            resetGame();
          }}
          onOpenStats={() => {
            setSettingsOpen(false); // Fecha o modal
            setStage("stats");
          }}
        />

        {/* Modal de Resultado */}
        <ResultModal
          visible={resultOpen}
          title={resultTitle}
          message={resultMessage}
          onPlayAgain={() => {
            setResultOpen(false);
            setGameKey((k) => k + 1);
          }}
          onExitToMenu={() => {
            setResultOpen(false);
            setStage("mode");
          }}
          onClose={() => setResultOpen(false)}
        />
      </View>
    </SafeAreaProvider>
  );
}

// Componente principal
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});