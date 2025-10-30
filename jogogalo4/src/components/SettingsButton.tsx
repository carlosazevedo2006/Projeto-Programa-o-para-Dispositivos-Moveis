// src/components/SettingsButton.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/Theme";

type Props = {
  onPress: () => void;
};

export default function SettingsButton({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Abrir definições"
    >
      <Text style={[styles.buttonText, { color: colors.text }]}>Definições</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 50,
    right: 16,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});