// App.tsx

// Importa React e hooks
import React, { useState, useEffect, useCallback } from "react";
// Provider de áreas seguras
import { SafeAreaProvider } from "react-native-safe-area-context";
// Componentes básicos
import { View, StyleSheet } from "react-native";

// Telas do projeto
import SplashScreen from "./src/screens/SplashScreen";
import ModeSelect from "./src/screens/ModeSelect";
import SinglePlayer from "./src/screens/SinglePlayer"; // agora escolhe X ou O
import PlayerSelect from "./src/screens/PlayerSelect";
import Game from "./src/screens/Game";

// Componentes auxiliares
import SettingsButton from "./src/components/SettingsButton";
import SettingsModal from "./src/components/SettingsModal";

// Estatísticas com normalização
import StatsScreen, { loadStats, saveStats, Stats } from "./src/screens/StatsScreen";

// Tema global
import { ThemeProvider, useTheme } from "./src/theme/Theme";

// Alias para compatibilidade
const GameComponent: any = Game;

// Componente interno para consumo do tema
function AppInner() {
  // Estado de navegação
  const [stage, setStage] = useState<"splash" | "mode" | "single" | "multi" | "game" | "stats">("splash");
  // Modal de definições
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Estatísticas globais
  const [stats, setStats] = useState<Stats>({ wins: 0, draws: 0, losses: 0 });
  // Força remontagem do Game
  const [gameKey, setGameKey] = useState(0);
  // Se o jogo atual é singleplayer
  const [isSingle, setIsSingle] = useState(false);
  // Símbolo escolhido pelo humano quando for singleplayer
  const [humanMark, setHumanMark] = useState<"X" | "O">("X");

  // Tema
  const { colors, toggleDarkMode } = useTheme();

  // Carrega e normaliza stats ao arrancar
  useEffect(() => {
    (async () => {
      const s = await loadStats();
      await saveStats(s);
      setStats(s);
    })();
  }, []);

  // Persiste stats em cada alteração
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Incrementos numéricos estáveis
  const addWin = useCallback(() => {
    setStats((s) => ({ ...s, wins: (Number(s.wins) || 0) + 1 }));
  }, []);
  const addDraw = useCallback(() => {
    setStats((s) => ({ ...s, draws: (Number(s.draws) || 0) + 1 }));
  }, []);
  const addLoss = useCallback(() => {
    setStats((s) => ({ ...s, losses: (Number(s.losses) || 0) + 1 }));
  }, []);

  // Reiniciar o jogo
  const resetGame = () => setGameKey((k) => k + 1);

  // Cálculo do símbolo do bot com base no humano
  const botMark: "X" | "O" = humanMark === "X" ? "O" : "X";

  // Render principal
  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Splash */}
        {stage === "splash" && (
          <SplashScreen
            onDone={() => setStage("mode")}
            onContinue={() => setStage("mode")}
          />
        )}

        {/* Seleção de modo */}
        {stage === "mode" && (
          <ModeSelect
            onChoose={(mode) => {
              if (mode === "single") {
                setIsSingle(true);      // single ativa bot
                setStage("single");     // vai escolher X ou O
              } else {
                setIsSingle(false);     // multi desativa bot
                setStage("multi");      // vai definir dois jogadores
              }
            }}
          />
        )}

        {/* Singleplayer: escolher X ou O */}
        {stage === "single" && (
          <SinglePlayer
            onChooseMark={(m) => {
              setHumanMark(m);          // guarda a escolha do utilizador
              setStage("game");         // entra logo no jogo
            }}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Multiplayer: ecrã de dois jogadores (já com tema) */}
        {stage === "multi" && (
          <PlayerSelect
            onStart={() => setStage("game")}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Jogo: passa botEnabled e marca do bot conforme a escolha feita */}
        {stage === "game" && (
          <GameComponent
            key={gameKey}
            onWin={addWin}
            onDraw={addDraw}
            onLoss={addLoss}
            onExit={() => setStage("mode")}
            botEnabled={isSingle}  // se single, ativa bot
            botMark={botMark}      // bot usa o oposto do humano
          />
        )}

        {/* Estatísticas */}
        {stage === "stats" && (
          <StatsScreen onBack={() => setStage("mode")} />
        )}

        {/* Botão das definições */}
        <SettingsButton onPress={() => setSettingsOpen(true)} />

        {/* Modal de definições */}
        <SettingsModal
          visible={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onToggleTheme={toggleDarkMode}
          onResetGame={() => {
            setSettingsOpen(false);
            resetGame();
          }}
          onOpenStats={() => {
            setSettingsOpen(false);
            setStage("stats");
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

// Exporta App envolto no ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// Estilos base
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
