// App.tsx

// Importa React e hooks
import React, { useState, useEffect, useCallback } from "react";
// Provider de áreas seguras (notch, barra de estado)
import { SafeAreaProvider } from "react-native-safe-area-context";
// Componentes básicos do React Native
import { View, StyleSheet } from "react-native";

// Telas do projeto
import SplashScreen from "./src/screens/SplashScreen";   // ecrã inicial (aceita só onDone)
import ModeSelect from "./src/screens/ModeSelect";       // seleção de modo
import SinglePlayer from "./src/screens/SinglePlayer";   // escolha de X ou O
import PlayerSelect from "./src/screens/PlayerSelect";   // dois jogadores (tema aplicado)
import Game from "./src/screens/Game";                   // jogo (com bot e fix de loop)

// Componentes auxiliares
import SettingsButton from "./src/components/SettingsButton"; // botão ⚙
import SettingsModal from "./src/components/SettingsModal";   // modal de definições

// Estatísticas com normalização e persistência
import StatsScreen, { loadStats, saveStats, Stats } from "./src/screens/StatsScreen";

// Tema global
import { ThemeProvider, useTheme } from "./src/theme/Theme";

// Alias para evitar conflitos de tipagem nas props do Game
const GameComponent: any = Game;

// Componente interno que consome o tema global
function AppInner() {
  // Navegação simples por estado
  const [stage, setStage] = useState<"splash" | "mode" | "single" | "multi" | "game" | "stats">("splash");
  // Modal de definições
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Estatísticas globais
  const [stats, setStats] = useState<Stats>({ wins: 0, draws: 0, losses: 0 });
  // Força remontagem do Game (reiniciar)
  const [gameKey, setGameKey] = useState(0);
  // Se o jogo é single (ativa bot)
  const [isSingle, setIsSingle] = useState(false);
  // Símbolo escolhido pelo humano no single
  const [humanMark, setHumanMark] = useState<"X" | "O">("X");

  // Tema global
  const { colors, toggleDarkMode } = useTheme();

  // Carrega e normaliza estatísticas ao arrancar
  useEffect(() => {
    (async () => {
      const s = await loadStats(); // lê do storage e normaliza
      await saveStats(s);          // regrava normalizado para “sanear”
      setStats(s);                 // aplica no estado
    })();
  }, []);

  // Persiste estatísticas em qualquer alteração
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Incrementos numéricos estáveis (evita concatenação de strings)
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

  // O bot usa o símbolo oposto ao do humano
  const botMark: "X" | "O" = humanMark === "X" ? "O" : "X";

  // Render principal
  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* SplashScreen: CORRIGIDO — só passamos onDone, pois SplashProps não tem onContinue */}
        {stage === "splash" && (
          <SplashScreen onDone={() => setStage("mode")} />
        )}

        {/* Seleção de modo: single ativa bot e leva à escolha X/O; multi leva a dois jogadores */}
        {stage === "mode" && (
          <ModeSelect
            onChoose={(mode) => {
              if (mode === "single") {
                setIsSingle(true);
                setStage("single");    // ecrã para escolher X ou O
              } else {
                setIsSingle(false);
                setStage("multi");     // ecrã de dois jogadores
              }
            }}
          />
        )}

        {/* Singleplayer: escolher X ou O. Ao escolher, entra logo no jogo. */}
        {stage === "single" && (
          <SinglePlayer
            onChooseMark={(m) => {
              setHumanMark(m);         // guarda símbolo do humano
              setStage("game");        // navega para o jogo
            }}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Multiplayer: dois jogadores (tema escuro aplicado) */}
        {stage === "multi" && (
          <PlayerSelect
            onStart={() => setStage("game")}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Jogo: passa botEnabled, botMark e humanMark */}
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
          />
        )}

        {/* Estatísticas persistidas */}
        {stage === "stats" && (
          <StatsScreen onBack={() => setStage("mode")} />
        )}

        {/* Botão de definições no canto inferior esquerdo */}
        <SettingsButton onPress={() => setSettingsOpen(true)} />

        {/* Modal de definições: alternar tema, abrir stats e reiniciar jogo */}
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

// Exporta App envolto no ThemeProvider (tema global em toda a UI)
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// Estilos de base
const styles = StyleSheet.create({
  container: {
    flex: 1,                  // ocupa o ecrã todo
    justifyContent: "center", // alinhamento vertical padrão
  },
});
