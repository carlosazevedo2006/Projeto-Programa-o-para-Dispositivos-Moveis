// src/components/SettingsButton.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/Theme";

// Props do botão
type Props = {
  onPress: () => void; // função chamada ao clicar
};

// Botão fixo de definições no canto inferior esquerdo
export default function SettingsButton({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress} // dispara apenas ao clicar
      accessibilityRole="button"
      accessibilityLabel="Abrir definições"
      accessibilityHint="Abre o modal de definições"
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: colors.text }]}>⚙️</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000, // garante que fica por cima de outros elementos
  },
  text: {
    fontSize: 24,
  },
});
