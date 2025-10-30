// src/screens/ModeSelectSingle.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../theme/Theme";
import { Difficulty } from "../logic/bot";

type Props = {
  onChoose: (difficulty: Difficulty) => void; // callback para iniciar o jogo
};

export default function ModeSelectSingle({ onChoose }: Props) {
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Difficulty | null>(null);

  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  return (
    <View style= { [styles.container, { backgroundColor: colors.background }]} >
    <Text style={ [styles.title, { color: colors.text }] }>
      Escolhe a dificuldade
        </Text>

  {
    difficulties.map((diff) => (
      <TouchableOpacity
          key= { diff }
          style = {
        [
          styles.button,
          {
            backgroundColor: selected === diff ? colors.primary : colors.card,
            borderColor: colors.border,
          },
          ]}
          onPress = {() => setSelected(diff)}
        >
    <Text
            style={
    [
      styles.buttonText,
      { color: selected === diff ? colors.background : colors.text },
    ]
  }
          >
    { diff === "easy"
    ? "Fácil"
    : diff === "medium"
      ? "Médio"
      : "Difícil"
}
</Text>
  </TouchableOpacity>
      ))}

<TouchableOpacity
        style={
  [
    styles.startButton,
    { backgroundColor: selected ? colors.primary : colors.border },
  ]
}
disabled = {!selected}
onPress = {() => selected && onChoose(selected)}
      >
  <Text style={ [styles.startText, { color: colors.background }] }>
    Iniciar
    </Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginVertical: 8,
    minWidth: 180,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  startButton: {
    marginTop: 32,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  startText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
