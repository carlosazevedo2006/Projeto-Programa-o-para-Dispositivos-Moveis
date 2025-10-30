// App.tsx

// Importa React e hooks essenciais
import React, { useState, useEffect, useCallback } from "react"; // useState para estados, useEffect para efeitos, useCallback para funções estáveis
// Provider para áreas seguras (notch, barra de estado)
import { SafeAreaProvider } from "react-native-safe-area-context"; // garante layout correto em dispositivos com notch
// Componentes básicos do React Native
import { View, StyleSheet } from "react-native"; // View para containers e StyleSheet para estilos

// Telas do projeto
import SplashScreen from "./src/screens/SplashScreen"; // ecrã inicial, aceita apenas onDone
import ModeSelect from "./src/screens/ModeSelect"; // ecrã de seleção de modo (single ou multi)
import SinglePlayer from "./src/screens/SinglePlayer"; // ecrã para escolher X/O e dificuldade
import PlayerSelect from "./src/screens/PlayerSelect"; // ecrã de dois jogadores (aplica tema)
import Game from "./src/screens/Game"; // ecrã do jogo, com bot e callbacks

// Componentes auxiliares
import SettingsButton from "./src/components/SettingsButton"; // botão de definições fixo no canto inferior esquerdo
import SettingsModal from "./src/components/SettingsModal"; // modal de definições (tema, stats, reset)
import ResultModal from "./src/components/ResultModal"; // modal reutilizável para mostrar resultado do jogo

// Estatísticas persistidas e normalizadas
import StatsScreen, { loadStats, saveStats, Stats } from "./src/screens/StatsScreen"; // tela de estatísticas e helpers

// Tema global
import { ThemeProvider, useTheme } from "./src/theme/Theme"; // provider e hook para paleta de cores

// *** CORREÇÃO ***
// Importa o tipo de dificuldade do bot a partir do ficheiro de IA (src/ai/bot.ts)
// Isto garante que "Facil", "Medio", "Dificil" são usados em toda a app.
import type { BotDifficulty } from "./src/ai/bot"; //

// Alias para evitar conflitos de tipagem caso Game não declare todas as novas props
const GameComponent: any = Game; // permite passar props extras sem erro de tipo

// (Tipo BotDifficulty removido daqui para usar o tipo importado)

// Componente interno que consome o tema global
function AppInner() {
  // Estado de navegação simples por etapas
  const [stage, setStage] = useState<"splash" | "mode" | "single" | "multi" | "game" | "stats">("splash"); // controla qual ecrã mostrar
  // Estado do modal de definições
  const [settingsOpen, setSettingsOpen] = useState(false); // controla visibilidade do modal de definições
  // Estado de estatísticas globais
  const [stats, setStats] = useState<Stats>({ wins: 0, draws: 0, losses: 0 }); // vitórias, empates, derrotas
  // Chave para forçar remontagem do Game (útil para reset rápido)
  const [gameKey, setGameKey] = useState(0); // incrementa para reiniciar o componente Game
  // Indica se o jogo atual é singleplayer (ativa o bot)
  const [isSingle, setIsSingle] = useState(false); // true para single, false para multi
  // Símbolo escolhido pelo humano no singleplayer
  const [humanMark, setHumanMark] = useState<"X" | "O">("X"); // por omissão "X"
  
  // *** CORREÇÃO ***
  // Dificuldade do bot no singleplayer (usa o tipo importado e o valor inicial correto "Medio")
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>("Medio"); //

  // Estado do modal de resultado
  const [resultOpen, setResultOpen] = useState(false); // controla visibilidade do ResultModal
  const [resultTitle, setResultTitle] = useState(""); // título mostrado no ResultModal
  const [resultMessage, setResultMessage] = useState<string | undefined>(undefined); // mensagem secundária

  // Usa o tema global (cores e alternador)
  const { colors, toggleDarkMode } = useTheme(); // cores do tema atual e função para alternar o modo

  // Carrega estatísticas ao arrancar a aplicação
  useEffect(() => {
    (async () => {
      const s = await loadStats(); // lê do AsyncStorage e normaliza
      await saveStats(s); // regrava normalizado para sanear valores antigos
      setStats(s); // aplica no estado local
    })();
  }, []); // [] significa: executa apenas uma vez ao montar

  // Persiste estatísticas sempre que mudarem
  useEffect(() => {
    saveStats(stats); // guarda no AsyncStorage
  }, [stats]); // [stats] significa: dispara quando stats muda

  // Funções de incremento com coação numérica e identidade estável (useCallback)
  const addWin = useCallback(() => {
    setStats((s) => ({ ...s, wins: (Number(s.wins) || 0) + 1 })); // soma numérica em vitórias
  }, []); // [] significa: sem dependências, a função nunca muda
  const addDraw = useCallback(() => {
    setStats((s) => ({ ...s, draws: (Number(s.draws) || 0) + 1 })); // soma numérica em empates
  }, []); // sem dependências
  const addLoss = useCallback(() => {
    setStats((s) => ({ ...s, losses: (Number(s.losses) || 0) + 1 })); // soma numérica em derrotas
  }, []); // sem dependências

  // Reinicia o jogo atual forçando remontagem do componente Game
  const resetGame = () => setGameKey((k) => k + 1); // incrementa a key para reiniciar o tabuleiro

  // Calcula a marca do bot com base na escolha do humano
  const botMark: "X" | "O" = humanMark === "X" ? "O" : "X"; // bot usa o símbolo oposto

  // Constrói título e mensagem do ResultModal ao fim do jogo e abre a janela
  const showResult = (winner: "X" | "O" | null) => {
    if (isSingle) {
      // Caso singleplayer
      if (winner === null) {
        setResultTitle("Empate"); // empate no single
        setResultMessage(undefined); // sem mensagem extra
      } else if (winner === humanMark) {
        setResultTitle("Ganhaste"); // humano venceu
        setResultMessage("O bot perdeu"); // mensagem secundária
      } else {
        setResultTitle("O bot ganhou"); // bot venceu
        setResultMessage("Perdeste esta partida"); // mensagem secundária
      }
      setResultOpen(true); // abre o modal
      return; // termina aqui
    }
    // Caso multiplayer (Jogador 1 = X, Jogador 2 = O por convenção)
    if (winner === null) {
      setResultTitle("Empate"); // empate no multi
      setResultMessage(undefined); // sem mensagem extra
    } else if (winner === "X") {
      setResultTitle("Vitória do Jogador 1"); // X venceu
      setResultMessage("Jogador 2 perdeu"); // mensagem secundária
    } else {
      setResultTitle("Vitória do Jogador 2"); // O venceu
      setResultMessage("Jogador 1 perdeu"); // mensagem secundária
    }
    setResultOpen(true); // abre o modal
  }; // fim de showResult

  // Render principal do app
  return (
    // Provider de áreas seguras
    <SafeAreaProvider>
      {/* Container raiz com cor de fundo do tema */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Ecrã inicial: apenas onDone é suportado pelo SplashScreen */}
        {stage === "splash" && (
          <SplashScreen onDone={() => setStage("mode")} /> // ao terminar o splash, vai para o menu de modos
        )}

        {/* Seleção de modo: define single ou multi e navega para a tela correspondente */}
        {stage === "mode" && (
          <ModeSelect
            onChoose={(mode) => {
              if (mode === "single") {
                setIsSingle(true); // ativa bot
                setStage("single"); // vai escolher X/O e dificuldade
              } else {
                setIsSingle(false); // desativa bot
                setStage("multi"); // vai para dois jogadores
              }
            }}
          />
        )}

        {/* Singleplayer: escolher X/O e dificuldade. Ao confirmar, entra no jogo. */}
        {stage === "single" && (
          <SinglePlayer
            onChoose={(payload) => {
              // *** CORREÇÃO ***
              // O payload.difficulty agora é "Facil", "Medio" ou "Dificil", que corresponde ao tipo do estado
              setHumanMark(payload.mark); // guarda a escolha do humano (X ou O)
              setBotDifficulty(payload.difficulty); // guarda a dificuldade escolhida
              setStage("game"); // navega para o jogo
            }}
            onBack={() => setStage("mode")} // voltar ao menu inicial
          />
        )}

        {/* Multiplayer: ecrã de dois jogadores (tema já aplicado) */}
        {stage === "multi" && (
          <PlayerSelect
            onStart={() => setStage("game")} // inicia o jogo a partir do multi
            onBack={() => setStage("mode")} // volta ao menu inicial
          />
        )}

        {/* Ecrã de jogo: passa callbacks, marcas, dificuldade e onGameEnd */}
        {stage === "game" && (
          <GameComponent
            key={gameKey} // força reset ao mudar a key
            onWin={addWin} // incrementa vitórias (usado no single)
            onDraw={addDraw} // incrementa empates
            onLoss={addLoss} // incrementa derrotas (usado no single)
            onExit={() => setStage("mode")} // sair do jogo volta ao menu
            botEnabled={isSingle} // ativa ou não o bot
            botMark={botMark} // símbolo do bot
            humanMark={humanMark} // símbolo do humano
            botDifficulty={botDifficulty} // passa a dificuldade escolhida
            onGameEnd={showResult} // callback para abrir a janela de resultado
          />
        )}

        {/* Ecrã de estatísticas com valores persistidos e normalizados */}
        {stage === "stats" && (
          <StatsScreen onBack={() => setStage("mode")} /> // voltar ao menu
        )}

        {/* Botão de definições persistente no canto inferior esquerdo */}
        <SettingsButton onPress={() => setSettingsOpen(true)} /> {/* abre o modal de definições */}

        {/* Modal de definições: alterna tema, mostra stats e reinicia jogo */}
        <SettingsModal
          visible={settingsOpen} // controla visibilidade
          onClose={() => setSettingsOpen(false)} // fecha o modal
          onToggleTheme={toggleDarkMode} // alterna entre claro e escuro
          onResetGame={() => { // reinicia a partida atual
            setSettingsOpen(false); // fecha o modal
            resetGame(); // força remontagem do Game
          }}
          onOpenStats={() => { // abre a tela de estatísticas
            setSettingsOpen(false); // fecha o modal
            setStage("stats"); // navega para stats
          }}
        />

        {/* Janela de resultado do jogo (single e multi) */}
        <ResultModal
          visible={resultOpen} // mostra/esconde janela
          title={resultTitle} // título calculado
          message={resultMessage} // mensagem secundária opcional
          onPlayAgain={() => { // ação "Jogar de novo"
            setResultOpen(false); // fecha a janela
            setGameKey((k) => k + 1); // reinicia o componente Game
          }}
          onExitToMenu={() => { // ação "Voltar ao menu"
            setResultOpen(false); // fecha a janela
            setStage("mode"); // vai para o menu principal
          }}
          onClose={() => setResultOpen(false)} // fechar sem mais ação
        />
      </View>
    </SafeAreaProvider>
  );
} // fim de AppInner

// Exporta App com o ThemeProvider envolvendo o AppInner
export default function App() {
  return (
    // O ThemeProvider dá a toda a app acesso ao tema (cores, modo escuro)
    <ThemeProvider>
      {/* O AppInner contém a lógica principal e consome o tema */}
      <AppInner />
    </ThemeProvider>
  );
}

// Estilos básicos do container raiz
const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa o ecrã inteiro
    justifyContent: "center", // alinha verticalmente por padrão
  },
});