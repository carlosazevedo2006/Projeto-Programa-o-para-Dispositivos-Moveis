// src/components/SettingsButton.tsx
// ---------------------------------------------------------------
// Botão de definições flutuante com melhorias visuais e de UX
// ---------------------------------------------------------------

import React from "react";
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  Animated 
} from "react-native";
import { useTheme } from "../theme/Theme";

type Props = {
  onPress: () => void;
};

export default function SettingsButton({ onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: colors.primary,
          shadowColor: colors.text,
        }
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Abrir menu de definições"
      accessibilityHint="Abre as definições do jogo incluindo tema e estatísticas"
    >
      <Text style={[styles.buttonText, { color: colors.card }]}>
        ⚙️
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "600",
  },
});