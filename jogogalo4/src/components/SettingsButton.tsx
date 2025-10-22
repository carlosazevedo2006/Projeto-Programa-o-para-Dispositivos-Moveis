// src/components/SettingsButton.tsx

// Importa React
import React from "react";
// Importa componentes do React Native
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

// Define as props aceitas
type Props = {
  onPress: () => void; // será chamado ao tocar no botão
  style?: ViewStyle;   // permite sobrepor estilos externos
};

// Componente de botão fixo no canto inferior esquerdo
export default function SettingsButton({ onPress, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}                // aplica estilo base e possíveis overrides
      onPress={onPress}                               // ação ao tocar
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // aumenta área sensível ao toque
      accessibilityRole="button"                      // marca como botão para acessibilidade
      accessibilityLabel="Abrir definições"           // rótulo de acessibilidade
    >
      <Text style={styles.icon}>⚙︎</Text>            {/* ícone textual simples */}
    </TouchableOpacity>
  );
}

// Estilos do botão
const styles = StyleSheet.create({
  container: {
    position: "absolute",             // fixa a posição
    left: 12,                         // distância da borda esquerda
    bottom: 12,                       // distância da borda inferior
    width: 40,                        // largura do botão
    height: 40,                       // altura do botão
    alignItems: "center",             // centraliza horizontalmente o conteúdo
    justifyContent: "center",         // centraliza verticalmente o conteúdo
    borderRadius: 8,                  // cantos arredondados
    borderWidth: 1,                   // largura da borda
    borderColor: "#888",              // cor da borda
    backgroundColor: "rgba(255,255,255,0.6)", // leve transparência
  },
  icon: {
    fontSize: 20,                     // tamanho do ícone textual
    color: "#111",                    // cor do ícone textual
  },
});
