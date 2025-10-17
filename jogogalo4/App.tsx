// Importa React e os hooks necessários
import React, { useMemo, useState } from "react";
// Importa o provider que respeita as margens seguras do ecrã (notches, barras, etc.)
import { SafeAreaProvider } from "react-native-safe-area-context";
// Importa componentes básicos do React Native
import { View, StyleSheet } from "react-native";

// Importa todos os ecrãs do projeto
import SplashScreen from "./src/screens/SplashScreen";   // ecrã inicial
import ModeSelect from "./src/screens/ModeSelect";       // seleção de modo e tema
import SinglePlayer from "./src/screens/SinglePlayer";   // modo contra o bot
import PlayerSelect from "./src/screens/PlayerSelect";   // modo multiplayer local
import Game from "./src/screens/Game";                   // tabuleiro e lógica principal

// Componente principal da aplicação
export default function App() {
  // Estado que controla qual ecrã está ativo no momento
  const [stage, setStage] = useState<"splash" | "mode" | "single" | "multi" | "game">("splash");

  // Estado com os nomes dos jogadores (pode ser 1 humano + bot ou 2 humanos)
  const [players, setPlayers] = useState<string[]>([]);

  // Indica se o modo é single player (vs bot)
  const [isSingle, setIsSingle] = useState(false);

  // Estado para tema escuro/claro
  const [darkMode, setDarkMode] = useState(false);

  //teste git23456

  // Cores do tema — aqui definimos manualmente as cores com base no modo atual
  const theme = useMemo(() => {
    return {
      background: darkMode ? "#121212" : "#FFFFFF", // cor de fundo
      text: darkMode ? "#FFFFFF" : "#000000",       // cor do texto
      button: darkMode ? "#444" : "#007bff",        // cor dos botões
    };
  }, [darkMode]); // só recalcula quando o tema mudar

  // Renderização principal do App
  return (
    // SafeAreaProvider evita sobreposição com notch e barras
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Ecrã de Splash (carregamento inicial com animação) */}
        {stage === "splash" && <SplashScreen onDone={() => setStage("mode")} />}

        {/* Menu principal (seleção de modo e tema) */}
        {stage === "mode" && (
          <ModeSelect
            darkMode={darkMode} // passa o estado do tema
            onToggleTheme={() => setDarkMode((v) => !v)} // alterna claro/escuro
            onChoose={(mode) => {
              // Se escolher single → vai para SinglePlayer
              // Se escolher multi → vai para PlayerSelect
              setIsSingle(mode === "single");
              setStage(mode === "single" ? "single" : "multi");
            }}
          />
        )}

        {/* Ecrã Single Player (escolher nome e começar contra o bot) */}
        {stage === "single" && (
          <SinglePlayer
            darkMode={darkMode}
            onStart={(name) => {
              const playerName = name.trim() || "Jogador"; // fallback se vazio
              setPlayers([playerName, "Bot"]); // define humano e bot
              setIsSingle(true);               // modo single
              setStage("game");                // inicia o jogo
            }}
            onBack={() => setStage("mode")} // voltar ao menu
          />
        )}

        {/* Ecrã Multiplayer (escolher nomes dos dois jogadores) */}
        {stage === "multi" && (
          <PlayerSelect
            darkMode={darkMode}
            onStart={(names) => {
              // nomes[0] = jogador 1, nomes[1] = jogador 2
              const j1 = names[0].trim() || "Jogador 1";
              const j2 = names[1].trim() || "Jogador 2";
              setPlayers([j1, j2]);
              setIsSingle(false); // multiplayer local
              setStage("game");
            }}
            onBack={() => setStage("mode")}
          />
        )}

        {/* Ecrã do jogo propriamente dito */}
        {stage === "game" && (
          <Game
            players={players}   // nomes dos jogadores
            isSingle={isSingle} // modo de jogo
            darkMode={darkMode} // tema atual
            onExit={() => setStage("mode")} // regressa ao menu
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

// Estilos básicos do container principal
const styles = StyleSheet.create({
  container: {
    flex: 1,              // ocupa todo o ecrã
    justifyContent: "center",
  },
});
