// src/screens/SinglePlayer.tsx
// =============================================================
// ECRÃ DE SELEÇÃO DE SINGLEPLAYER - CONFIGURAÇÃO DO JOGO VS BOT
// =============================================================

// Importa React e hooks necessários
import React, { useState, useCallback } from "react";
// Importa componentes do React Native
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,    // ✅ CORREÇÃO: Importar Platform para detetar o SO
  Vibration    // ✅ CORREÇÃO: Importar Vibration para feedback tátil
} from "react-native";
// Importa o sistema de temas para cores consistentes
import { useTheme } from "../theme/Theme";
// Importa o tipo de dificuldade do bot (definido no ficheiro da IA)
import type { BotDifficulty } from "../ai/bot";

// =============================================================
// DEFINIÇÃO DAS PROPRIEDADES DO COMPONENTE
// =============================================================
type Props = {
  // Callback chamado quando o utilizador confirma as seleções
  onChoose: (payload: { mark: "X" | "O"; difficulty: BotDifficulty }) => void;
  // Callback para voltar ao ecrã anterior
  onBack: () => void;
};

// =============================================================
// DESCRIÇÕES DAS DIFICULDADES PARA MELHOR EXPERIÊNCIA DO UTILIZADOR
// =============================================================
const DIFFICULTY_DESCRIPTIONS: Record<BotDifficulty, string> = {
  "Facil": "🤖 O bot faz jogadas básicas - Perfeito para iniciantes",
  "Medio": "🎯 O bot bloqueia e ataca - Bom para jogadores experientes", 
  "Dificil": "🧠 Algoritmo avançado - Quase impossível de vencer"
};

// =============================================================
// COMPONENTE PRINCIPAL - SINGLEPLAYER SCREEN
// =============================================================
export default function SinglePlayer({ onChoose, onBack }: Props) {
  // =============================================================
  // HOOKS E ESTADOS
  // =============================================================
  
  // Obtém as cores do tema atual (modo claro/escuro)
  const { colors, darkMode } = useTheme();

  // Estado para guardar o símbolo selecionado pelo jogador (X ou O)
  const [selectedMark, setSelectedMark] = useState<"X" | "O" | null>(null);
  
  // Estado para guardar a dificuldade selecionada do bot
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>("Medio");

  // =============================================================
  // FUNÇÕES DE MANIPULAÇÃO DE EVENTOS (useCallback para performance)
  // =============================================================

  /**
   * Manipula a seleção do símbolo pelo jogador
   * @param mark - Símbolo selecionado ("X" ou "O")
   */
  const handleMarkSelection = useCallback((mark: "X" | "O") => {
    // Atualiza o estado com o símbolo selecionado
    setSelectedMark(mark);
    
    // ✅ CORREÇÃO: Verificar se Platform existe antes de usar
    // Adiciona feedback tátil em dispositivos móveis (não web)
    if (Platform && Platform.OS !== 'web') {
      Vibration.vibrate(25); // Vibração curta para feedback
    }
  }, []); // Array vazio - função estável

  /**
   * Manipula a seleção da dificuldade do bot
   * @param difficulty - Dificuldade selecionada
   */
  const handleDifficultySelection = useCallback((difficulty: BotDifficulty) => {
    // Atualiza o estado com a dificuldade selecionada
    setSelectedDifficulty(difficulty);
    
    // ✅ CORREÇÃO: Verificar se Platform existe antes de usar
    // Adiciona feedback tátil em dispositivos móveis
    if (Platform && Platform.OS !== 'web') {
      Vibration.vibrate(25); // Vibração curta para feedback
    }
  }, []); // Array vazio - função estável

  /**
   * Manipula o início do jogo com validações
   */
  const handleStartGame = useCallback(() => {
    // Valida se o jogador selecionou um símbolo
    if (!selectedMark) {
      Alert.alert(
        "Escolha Necessária", // Título do alerta
        "Por favor, seleciona o teu símbolo para começar o jogo.", // Mensagem
        [{ text: "Entendi", style: "default" }] // Botão de confirmação
      );
      return; // Sai da função se não houver símbolo selecionado
    }

    // Confirmação extra para modo difícil com símbolo O (bot começa)
    if (selectedDifficulty === "Dificil" && selectedMark === "O") {
      Alert.alert(
        "Modo Desafiador", // Título
        "Jogar como 'O' no modo Difícil é muito desafiador! O bot jogará primeiro e é quase perfeito. Tens a certeza?", // Mensagem
        [
          { text: "Voltar", style: "cancel" }, // Botão cancelar
          { 
            text: "Sim, Aceito o Desafio!", 
            style: "destructive", // Estilo destrutivo para ação perigosa
            onPress: () => onChoose({ 
              mark: selectedMark, 
              difficulty: selectedDifficulty 
            })
          },
        ]
      );
    } else {
      // Inicia o jogo diretamente para outros casos
      onChoose({ 
        mark: selectedMark, 
        difficulty: selectedDifficulty 
      });
    }
  }, [selectedMark, selectedDifficulty, onChoose]); // Dependências estáveis

  // =============================================================
  // FUNÇÕES DE RENDERIZAÇÃO (useCallback para performance)
  // =============================================================

  /**
   * Renderiza o seletor de símbolos (X ou O)
   */
  const renderMarkSelector = useCallback(() => (
    <View style={styles.section}>
      {/* Título da secção */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Escolhe o Teu Símbolo
      </Text>
      
      {/* Descrição informativa */}
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        💡 Lembra-te: O jogador 'X' começa sempre o jogo!
      </Text>
      
      {/* Container dos símbolos */}
      <View style={styles.markSelectionContainer}>
        
        {/* Opção X */}
        <TouchableOpacity
          onPress={() => handleMarkSelection("X")} // Define X como selecionado
          style={[
            styles.markOption,
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              // ✅ Efeito visual quando selecionado
              ...(selectedMark === "X" && {
                borderColor: colors.primary, // Borda colorida
                backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', // Fundo destacado
              })
            },
          ]}
          accessibilityRole="button" // Semântica de acessibilidade
          accessibilityLabel="Escolher símbolo X, começas primeiro"
          accessibilityState={{ selected: selectedMark === "X" }} // Estado para leitores de ecrã
        >
          {/* Símbolo grande */}
          <Text style={[
            styles.markSymbol, 
            { color: selectedMark === "X" ? colors.primary : colors.text }
          ]}>
            X
          </Text>
          
          {/* Label descritivo */}
          <Text style={[
            styles.markLabel, 
            { color: selectedMark === "X" ? colors.primary : colors.text }
          ]}>
            Jogar como X
          </Text>
          
          {/* Nota informativa */}
          <Text style={[styles.markDescription, { color: colors.textSecondary }]}>
            Começas primeiro
          </Text>
        </TouchableOpacity>

        {/* Opção O */}
        <TouchableOpacity
          onPress={() => handleMarkSelection("O")} // Define O como selecionado
          style={[
            styles.markOption,
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              // ✅ Efeito visual quando selecionado
              ...(selectedMark === "O" && {
                borderColor: colors.primary, // Borda colorida
                backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', // Fundo destacado
              })
            },
          ]}
          accessibilityRole="button" // Semântica de acessibilidade
          accessibilityLabel="Escolher símbolo O, bot começa primeiro"
          accessibilityState={{ selected: selectedMark === "O" }} // Estado para leitores de ecrã
        >
          {/* Símbolo grande */}
          <Text style={[
            styles.markSymbol, 
            { color: selectedMark === "O" ? colors.primary : colors.text }
          ]}>
            O
          </Text>
          
          {/* Label descritivo */}
          <Text style={[
            styles.markLabel, 
            { color: selectedMark === "O" ? colors.primary : colors.text }
          ]}>
            Jogar como O
          </Text>
          
          {/* Nota informativa */}
          <Text style={[styles.markDescription, { color: colors.textSecondary }]}>
            Bot começa primeiro
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [colors, darkMode, selectedMark, handleMarkSelection]); // Dependências estáveis

  /**
   * Renderiza o seletor de dificuldade do bot
   */
  const renderDifficultySelector = useCallback(() => (
    <View style={styles.section}>
      {/* Título da secção */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Nível de Dificuldade
      </Text>
      
      {/* Container das opções de dificuldade */}
      <View style={styles.difficultyContainer}>
        {/* Mapeia cada dificuldade disponível */}
        {(["Facil", "Medio", "Dificil"] as BotDifficulty[]).map((difficulty) => (
          <TouchableOpacity
            key={difficulty} // Chave única para React
            onPress={() => handleDifficultySelection(difficulty)} // Define dificuldade
            style={[
              styles.difficultyOption,
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                // ✅ Efeito visual quando selecionado
                ...(selectedDifficulty === difficulty && {
                  borderColor: colors.primary, // Borda colorida
                  backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', // Fundo destacado
                })
              },
            ]}
            accessibilityRole="button" // Semântica de acessibilidade
            accessibilityLabel={`Dificuldade ${difficulty}`}
            accessibilityState={{ selected: selectedDifficulty === difficulty }} // Estado para leitores de ecrã
          >
            {/* Título da dificuldade com emoji */}
            <Text style={[
              styles.difficultyTitle,
              { color: selectedDifficulty === difficulty ? colors.primary : colors.text }
            ]}>
              {difficulty === "Facil" ? "🥉 Fácil" : 
               difficulty === "Medio" ? "🥈 Médio" : "🥇 Difícil"}
            </Text>
            
            {/* Descrição detalhada da dificuldade */}
            <Text style={[styles.difficultyDescription, { color: colors.textSecondary }]}>
              {DIFFICULTY_DESCRIPTIONS[difficulty]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [colors, darkMode, selectedDifficulty, handleDifficultySelection]); // Dependências estáveis

  // =============================================================
  // RENDERIZAÇÃO PRINCIPAL DO COMPONENTE
  // =============================================================
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]} // Fundo do tema
      contentContainerStyle={styles.scrollContent} // Estilo do conteúdo scrollável
      showsVerticalScrollIndicator={false} // Esconde a barra de scroll vertical
    >
      {/* Cabeçalho do ecrã */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Modo Singleplayer
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enfrenta o nosso bot inteligente!
        </Text>
      </View>

      {/* Secção de seleção de símbolo */}
      {renderMarkSelector()}
      
      {/* Secção de seleção de dificuldade */}
      {renderDifficultySelector()}

      {/* Área de ações (botões) */}
      <View style={styles.actions}>
        {/* Botão Voltar */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border 
            }
          ]}
          onPress={onBack} // Volta ao ecrã anterior
          accessibilityRole="button"
          accessibilityLabel="Voltar ao menu anterior"
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            ↩️ Voltar
          </Text>
        </TouchableOpacity>

        {/* Botão Começar Jogo */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              // ✅ Cor diferente consoante o estado (selecionado/não selecionado)
              backgroundColor: selectedMark ? colors.primary : colors.muted,
              borderColor: selectedMark ? colors.primary : colors.border,
            },
            // ✅ Estilo desativado quando não há símbolo selecionado
            !selectedMark && styles.actionButtonDisabled
          ]}
          onPress={handleStartGame} // Inicia o jogo
          disabled={!selectedMark} // Desativa se não houver símbolo selecionado
          accessibilityRole="button"
          accessibilityLabel={selectedMark ? "Começar jogo" : "Seleciona um símbolo para começar"}
          accessibilityState={{ disabled: !selectedMark }} // Estado para leitores de ecrã
        >
          <Text style={[
            styles.actionButtonText, 
            { color: selectedMark ? colors.card : colors.text } // Cor do texto consoante estado
          ]}>
            🚀 Começar Jogo
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// =============================================================
// ESTILOS DO COMPONENTE
// =============================================================
const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1, // Ocupa todo o espaço disponível
  },
  // Conteúdo do ScrollView
  scrollContent: {
    padding: 20, // Espaçamento interno
    paddingTop: 40, // Espaçamento superior extra
  },
  // Cabeçalho
  header: {
    alignItems: "center", // Centraliza horizontalmente
    marginBottom: 40, // Espaço abaixo
  },
  // Título principal
  title: {
    fontSize: 28, // Tamanho grande
    fontWeight: "800", // Negrito forte
    marginBottom: 8, // Espaço abaixo
    textAlign: "center", // Texto centralizado
  },
  // Subtítulo
  subtitle: {
    fontSize: 16, // Tamanho médio
    fontWeight: "500", // Negrito médio
    textAlign: "center", // Texto centralizado
  },
  // Secção genérica
  section: {
    marginBottom: 32, // Espaço entre secções
  },
  // Título da secção
  sectionTitle: {
    fontSize: 20, // Tamanho médio-grande
    fontWeight: "700", // Negrito
    marginBottom: 8, // Espaço abaixo
  },
  // Descrição da secção
  sectionDescription: {
    fontSize: 14, // Tamanho pequeno
    marginBottom: 16, // Espaço abaixo
  },
  // Container da seleção de símbolos
  markSelectionContainer: {
    flexDirection: "row", // Layout horizontal
    gap: 16, // Espaço entre elementos (React Native 0.71+)
  },
  // Opção de símbolo (X ou O)
  markOption: {
    flex: 1, // Ocupa espaço igual
    borderWidth: 2, // Borda grossa
    borderRadius: 16, // Cantos muito arredondados
    padding: 20, // Espaçamento interno
    alignItems: "center", // Centraliza conteúdo
    // Sombra para efeito de profundidade
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // Sombra no Android
  },
  // Símbolo (X ou O grande)
  markSymbol: {
    fontSize: 42, // Tamanho muito grande
    fontWeight: "900", // Negrito máximo
    marginBottom: 8, // Espaço abaixo
  },
  // Label do símbolo
  markLabel: {
    fontSize: 16, // Tamanho médio
    fontWeight: "700", // Negrito
    marginBottom: 4, // Espaço abaixo
  },
  // Descrição do símbolo
  markDescription: {
    fontSize: 12, // Tamanho pequeno
    fontWeight: "500", // Negrito médio
  },
  // Container das dificuldades
  difficultyContainer: {
    gap: 12, // Espaço entre opções
  },
  // Opção de dificuldade
  difficultyOption: {
    borderWidth: 2, // Borda grossa
    borderRadius: 12, // Cantos arredondados
    padding: 16, // Espaçamento interno
    // Sombra suave
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Sombra no Android
  },
  // Título da dificuldade
  difficultyTitle: {
    fontSize: 18, // Tamanho médio-grande
    fontWeight: "700", // Negrito
    marginBottom: 4, // Espaço abaixo
  },
  // Descrição da dificuldade
  difficultyDescription: {
    fontSize: 14, // Tamanho pequeno
    fontWeight: "400", // Peso normal
  },
  // Container dos botões de ação
  actions: {
    flexDirection: "row", // Layout horizontal
    gap: 12, // Espaço entre botões
    marginTop: 20, // Espaço acima
    marginBottom: 40, // Espaço abaixo
  },
  // Botão de ação genérico
  actionButton: {
    flex: 1, // Ocupa espaço igual
    borderWidth: 2, // Borda grossa
    borderRadius: 12, // Cantos arredondados
    paddingVertical: 16, // Espaçamento vertical
    paddingHorizontal: 20, // Espaçamento horizontal
    alignItems: "center", // Centraliza texto
  },
  // Estado desativado do botão
  actionButtonDisabled: {
    opacity: 0.6, // Transparência para indicar desativado
  },
  // Texto do botão de ação
  actionButtonText: {
    fontSize: 16, // Tamanho médio
    fontWeight: "700", // Negrito
  },
});