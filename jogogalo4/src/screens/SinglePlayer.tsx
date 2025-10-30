// src/screens/SinglePlayer.tsx

// Importa React e o hook de estado
import React, { useState } from "react";
// Importa componentes base do React Native
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
// Importa o tema global (para cores e modo escuro)
import { useTheme } from "../theme/Theme";
// Importa o tipo de dificuldade usado no resto da app/IA
import type { BotDifficulty } from "../ai/bot";

// Define o formato das props deste ecrã (o que o App.tsx lhe passa)
type Props = {
  onChoose: (payload: { mark: "X" | "O"; difficulty: BotDifficulty }) => void;
  onBack: () => void;
};

// Componente do ecrã de configuração do singleplayer
export default function SinglePlayer({ onChoose, onBack }: Props) {
  const { colors } = useTheme();

  const [mark, setMark] = useState<"X" | "O" | null>(null);
  const [difficulty, setDifficulty] = useState<BotDifficulty>("Medio");

  const handleStart = () => {
    if (!mark) {
      Alert.alert(
        "Seleção necessária",
        "Por favor, escolhe o teu símbolo para começar o jogo.",
        [{ text: "OK" }]
      );
      return;
    }
    onChoose({ mark, difficulty });
  };

  // ... resto do código (igual ao que tinhas) ...

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Singleplayer</Text>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        X começa o jogo. Se escolheres O, o bot (X) joga primeiro.
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolhe o teu símbolo</Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setMark("X")}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            mark === "X" && { borderColor: "#4f8cff" },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Escolher X"
        >
          <Text style={[styles.mark, { color: colors.text }]}>X</Text>
          <Text style={[styles.caption, { color: colors.text }]}>Cruz</Text>
          <Text style={[styles.note, { color: colors.muted }]}>Começas primeiro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMark("O")}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            mark === "O" && { borderColor: "#4f8cff" },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Escolher O"
        >
          <Text style={[styles.mark, { color: colors.text }]}>O</Text>
          <Text style={[styles.caption, { color: colors.text }]}>Círculo</Text>
          <Text style={[styles.note, { color: colors.muted }]}>Bot começa</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Dificuldade do bot</Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => setDifficulty("Facil")}
          style={[
            styles.pill,
            { backgroundColor: colors.card, borderColor: colors.border },
            difficulty === "Facil" && { borderColor: "#4f8cff" },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Fácil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDifficulty("Medio")}
          style={[
            styles.pill,
            { backgroundColor: colors.card, borderColor: colors.border },
            difficulty === "Medio" && { borderColor: "#4f8cff" },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Médio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDifficulty("Dificil")}
          style={[
            styles.pill,
            { backgroundColor: colors.card, borderColor: colors.border },
            difficulty === "Dificil" && { borderColor: "#4f8cff" },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Difícil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={onBack}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.card, borderColor: colors.border },
            !mark && { opacity: 0.5 },
          ]}
          onPress={handleStart}
          disabled={!mark}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Começar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos (mantidos iguais)
const styles = StyleSheet.create({ 
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },
  mark: {
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 8,
  },
  caption: {
    fontSize: 16,
    fontWeight: "600",
  },
  note: {
    fontSize: 12,
    marginTop: 4,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});