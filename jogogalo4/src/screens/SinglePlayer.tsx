// src/screens/SinglePlayer.tsx
// ---------------------------------------------------------------
// Ecrã de configuração do singleplayer com melhorias de UX,
// validações e feedback visual melhorado.
// ---------------------------------------------------------------

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView
} from "react-native";
import { useTheme } from "../theme/Theme";
import type { BotDifficulty } from "../ai/bot";

// Define o formato das props
type Props = {
  onChoose: (payload: { mark: "X" | "O"; difficulty: BotDifficulty }) => void;
  onBack: () => void;
};

// Descrições das dificuldades para melhor UX
const DIFFICULTY_DESCRIPTIONS: Record<BotDifficulty, string> = {
  "Facil": "🤖 O bot faz jogadas básicas - Perfeito para iniciantes",
  "Medio": "🎯 O bot bloqueia e ataca - Bom para jogadores experientes", 
  "Dificil": "🧠 Algoritmo avançado - Quase impossível de vencer"
};

// Componente do ecrã de configuração do singleplayer
export default function SinglePlayer({ onChoose, onBack }: Props) {
  const { colors, darkMode } = useTheme();

  // Estado local com valores iniciais
  const [selectedMark, setSelectedMark] = useState<"X" | "O" | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>("Medio");

  // Handler para iniciar o jogo com validação
  const handleStartGame = useCallback(() => {
    if (!selectedMark) {
      Alert.alert(
        "Escolha Necessária",
        "Por favor, seleciona o teu símbolo para começar o jogo.",
        [{ text: "Entendi", style: "default" }]
      );
      return;
    }

    // Confirmação para dificuldade difícil
    if (selectedDifficulty === "Dificil" && selectedMark === "O") {
      Alert.alert(
        "Modo Desafiador",
        "Jogar como 'O' no modo Difícil é muito desafiador! O bot jogará primeiro e é quase perfeito. Tens a certeza?",
        [
          { text: "Voltar", style: "cancel" },
          { 
            text: "Sim, Aceito o Desafio!", 
            style: "destructive",
            onPress: () => onChoose({ mark: selectedMark, difficulty: selectedDifficulty })
          },
        ]
      );
    } else {
      onChoose({ mark: selectedMark, difficulty: selectedDifficulty });
    }
  }, [selectedMark, selectedDifficulty, onChoose]);

  // Handler para seleção de símbolo
  const handleMarkSelection = useCallback((mark: "X" | "O") => {
    setSelectedMark(mark);
    // Feedback visual imediato
    if (Platform.OS !== 'web') {
      Vibration.vibrate(25);
    }
  }, []);

  // Handler para seleção de dificuldade
  const handleDifficultySelection = useCallback((difficulty: BotDifficulty) => {
    setSelectedDifficulty(difficulty);
    // Feedback visual imediato
    if (Platform.OS !== 'web') {
      Vibration.vibrate(25);
    }
  }, []);

  // Renderização do seletor de símbolo
  const renderMarkSelector = useCallback(() => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Escolhe o Teu Símbolo
      </Text>
      <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
        💡 Lembra-te: O jogador 'X' começa sempre o jogo!
      </Text>
      
      <View style={styles.markSelectionContainer}>
        {/* Opção X */}
        <TouchableOpacity
          onPress={() => handleMarkSelection("X")}
          style={[
            styles.markOption,
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              // Destaque quando selecionado
              ...(selectedMark === "X" && {
                borderColor: colors.primary,
                backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
              })
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Escolher símbolo X, começas primeiro"
          accessibilityState={{ selected: selectedMark === "X" }}
        >
          <Text style={[
            styles.markSymbol, 
            { color: selectedMark === "X" ? colors.primary : colors.text }
          ]}>
            X
          </Text>
          <Text style={[
            styles.markLabel, 
            { color: selectedMark === "X" ? colors.primary : colors.text }
          ]}>
            Jogar como X
          </Text>
          <Text style={[styles.markDescription, { color: colors.textSecondary }]}>
            Começas primeiro
          </Text>
        </TouchableOpacity>

        {/* Opção O */}
        <TouchableOpacity
          onPress={() => handleMarkSelection("O")}
          style={[
            styles.markOption,
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              // Destaque quando selecionado
              ...(selectedMark === "O" && {
                borderColor: colors.primary,
                backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
              })
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Escolher símbolo O, bot começa primeiro"
          accessibilityState={{ selected: selectedMark === "O" }}
        >
          <Text style={[
            styles.markSymbol, 
            { color: selectedMark === "O" ? colors.primary : colors.text }
          ]}>
            O
          </Text>
          <Text style={[
            styles.markLabel, 
            { color: selectedMark === "O" ? colors.primary : colors.text }
          ]}>
            Jogar como O
          </Text>
          <Text style={[styles.markDescription, { color: colors.textSecondary }]}>
            Bot começa primeiro
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [colors, darkMode, selectedMark, handleMarkSelection]);

  // Renderização do seletor de dificuldade
  const renderDifficultySelector = useCallback(() => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Nível de Dificuldade
      </Text>
      
      <View style={styles.difficultyContainer}>
        {(["Facil", "Medio", "Dificil"] as BotDifficulty[]).map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            onPress={() => handleDifficultySelection(difficulty)}
            style={[
              styles.difficultyOption,
              { 
                backgroundColor: colors.card, 
                borderColor: colors.border,
                // Destaque quando selecionado
                ...(selectedDifficulty === difficulty && {
                  borderColor: colors.primary,
                  backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe',
                })
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Dificuldade ${difficulty}`}
            accessibilityState={{ selected: selectedDifficulty === difficulty }}
          >
            <Text style={[
              styles.difficultyTitle,
              { color: selectedDifficulty === difficulty ? colors.primary : colors.text }
            ]}>
              {difficulty === "Facil" ? "🥉 Fácil" : 
               difficulty === "Medio" ? "🥈 Médio" : "🥇 Difícil"}
            </Text>
            <Text style={[styles.difficultyDescription, { color: colors.textSecondary }]}>
              {DIFFICULTY_DESCRIPTIONS[difficulty]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ), [colors, darkMode, selectedDifficulty, handleDifficultySelection]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Modo Singleplayer
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enfrenta o nosso bot inteligente!
        </Text>
      </View>

      {/* Conteúdo */}
      {renderMarkSelector()}
      {renderDifficultySelector()}

      {/* Ações */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border 
            }
          ]}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Voltar ao menu anterior"
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>
            ↩️ Voltar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { 
              backgroundColor: selectedMark ? colors.primary : colors.muted,
              borderColor: selectedMark ? colors.primary : colors.border,
            },
            !selectedMark && styles.actionButtonDisabled
          ]}
          onPress={handleStartGame}
          disabled={!selectedMark}
          accessibilityRole="button"
          accessibilityLabel={selectedMark ? "Começar jogo" : "Seleciona um símbolo para começar"}
          accessibilityState={{ disabled: !selectedMark }}
        >
          <Text style={[
            styles.actionButtonText, 
            { color: selectedMark ? colors.card : colors.text }
          ]}>
            🚀 Começar Jogo
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Estilos melhorados com design mais moderno
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  markSelectionContainer: {
    flexDirection: "row",
    gap: 16,
  },
  markOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  markSymbol: {
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 8,
  },
  markLabel: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  markDescription: {
    fontSize: 12,
    fontWeight: "500",
  },
  difficultyContainer: {
    gap: 12,
  },
  difficultyOption: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  difficultyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  difficultyDescription: {
    fontSize: 14,
    fontWeight: "400",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});