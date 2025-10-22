// App.tsx

// Importa React e hooks
import React, { useState, useEffect, useCallback } from "react";
// Provider para áreas seguras (notch, barra de estado)
import { SafeAreaProvider } from "react-native-safe-area-context";
// Componentes básicos do React Native
import { View, StyleSheet } from "react-native";

// Telas do projeto
import SplashScreen from "./src/screens/SplashScreen";   // ecrã inicial (já existente no teu projeto)
import ModeSelect from "./src/screens/ModeSelect";       // seleção de modo (corrigido para usar Text)
import SinglePlayer from "./src/screens/SinglePlayer";   // ecrã de nome do single (com tema)
import PlayerSelect from "./src/screens/PlayerSelect";   // ecrã de dois jogadores (com tema)
import Game from "./src/screens/Game";                   // tabuleiro e lógica (com bot e fix de loop)

// Componentes auxiliares
import SettingsButton from "./src/components/SettingsButton"; // botão fixo de definições
import SettingsModal from "./src/components/SettingsModal";   // modal de definições

// Estatísticas com normalização e persistência
import StatsScreen, { loadStats, saveStats, Stats } from "./src/screens/StatsScreen";

// Tema global
import { ThemeProvider, useTheme } from "./src/theme/Theme";

// Alias para o Game, caso ele não tipifique novas props
const GameComponent: any = Game;

// Componente interno para poder usar o hook de tema
function AppInner() {
  // Estado de navegação simples por etapas
  const [stage, setStage] = useState<"splash" | "mode" | "single" | "multi" | "game" | "stats">("splash");
  // Controla a abertura do modal de definições
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Estatísticas globais persistidas
  const [stats, setStats] = useState<Stats>({ wins: 0, draws: 0, losses: 0 });
  // Chave para forçar reset do Game (remontagem)
  const [gameKey, setGameKey] = useState(0);
  // Indica se o jogo atual é singleplayer (para ativar o bot)
  const [isSingle, setIsSingle] = useState(false);

  // Obtém cores e alternador de tema do contexto global
  const { colors, toggleDarkMode } = useTheme();

  // Carrega estatísticas ao iniciar e já normaliza valores
  useEffect(() => {
    (async () => {
      const s = await loadStats(); // lê e normaliza
      await saveStats(s);          // regrava normalizado para reparar storage antigo
      setStats(s);                 // aplica ao estado
    })();
  }, []);

  // Sempre que as estatísticas mudarem, persiste
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Funções de incremento com coação para número e identidade estável
  const addWin = useCallback(() => {
    setStats((s) => ({ ...s, wins: (Number(s.wins) || 0) + 1 }));
  }, []);
  const addDraw = useCallback(() => {
    setStats((s) => ({ ...s, draws: (Number(s.draws) || 0) + 1 }));
  }, []);
  const addLoss = useCallback(() => {
    setStats((s) => ({ ...s, losses: (Number(s.losses) || 0) + 1 }));
  }, []);

  // Reinicia o jogo gerando uma nova key para o componente Game
  const resetGame = () => setGameKey((k) => k + 1);

  // Render da aplicação
  return (
    // Provider de áreas seguras
    <SafeAreaProvider>
      {/* Container raiz com fundo conforme o tema */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Ecrã inicial: avança para a seleção de modo */}
        {stage === "splash" && (
          <SplashScreen
            onDone={() => setStage("mode")}     // callback que o Splash espera
            onContinue={() => setStage("mode")} // redundante, compatibilidade
          />
        )}

        {/* Seleção de modo: define se é single (bot) ou multi */}
        {stage === "mode" && (
          <ModeSelect
            onChoose={(mode) => {
              if (mode === "single") {
                setIsSingle(true);    // ativa o bot
                setStage("single");   // vai para o ecrã de nome do single
              } else {
                setIsSingle(false);   // sem bot
                setStage("multi");    // vai para o ecrã de dois jogadores
              }
            }}
          />
        )}

        {/* Ecrã de nome do single player, já com tema escuro/claro */}
        {stage === "single" && (
          <SinglePlayer
            onStart={() => setStage("game")} // inicia o jogo
            onBack={() => setStage("mode")}  // volta ao menu inicial
          />
        )}

        {/* Ecrã de dois jogadores, também com suporte a tema */}
        {stage === "multi" && (
          <PlayerSelect
            onStart={() => setStage("game")} // inicia o jogo
            onBack={() => setStage("mode")}  // volta ao menu inicial
          />
        )}

        {/* Jogo: passa callbacks de resultado e ativa bot se isSingle for true */}
        {stage === "game" && (
          <GameComponent
            key={gameKey}             // força remontagem em resets
            onWin={addWin}            // incrementa vitórias de forma segura
            onDraw={addDraw}          // incrementa empates
            onLoss={addLoss}          // incrementa derrotas
            onExit={() => setStage("mode")} // volta ao menu
            botEnabled={isSingle}     // ativa bot apenas no singleplayer
            botMark="O"               // bot joga como "O"; humano como "X"
          />
        )}

        {/* Ecrã de estatísticas persistidas e normalizadas */}
        {stage === "stats" && (
          <StatsScreen
            onBack={() => setStage("mode")}   // volta ao menu
          />
        )}

        {/* Botão de definições no canto inferior esquerdo */}
        <SettingsButton onPress={() => setSettingsOpen(true)} />

        {/* Modal de definições: alterna tema, abre stats e reinicia jogo */}
        <SettingsModal
          visible={settingsOpen}                 // controla visibilidade
          onClose={() => setSettingsOpen(false)} // fecha modal
          onToggleTheme={toggleDarkMode}         // alterna tema global
          onResetGame={() => {                   // reinicia o jogo atual
            setSettingsOpen(false);              // fecha modal
            resetGame();                         // força remontagem do Game
          }}
          onOpenStats={() => {                   // abre a tela de estatísticas
            setSettingsOpen(false);              // fecha modal
            setStage("stats");                   // navega para stats
          }}
        />
      </View>
    </SafeAreaProvider>
  );
}

// Exporta App envolto no ThemeProvider para tema global
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// Estilos básicos do container raiz
const styles = StyleSheet.create({
  container: {
    flex: 1,                  // ocupa o ecrã inteiro
    justifyContent: "center", // alinha verticalmente por padrão
  },
});
