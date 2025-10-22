// src/screens/ModeSelect.tsx

// Importa React
import React from "react";
// Importa componentes do React Native
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
// Importa o hook de tema para aplicar cores globais
import { useTheme } from "../theme/Theme";

// Define a tipagem das propriedades esperadas
type ModeSelectProps = {
  onChoose?: (mode: "single" | "multi") => void; // callback para escolher modo
};

// Componente de seleção de modo
export default function ModeSelect({ onChoose }: ModeSelectProps) {
  // Obtém as cores do tema global
  const { colors } = useTheme();

  // Handler para modo single
  const handleSingle = () => onChoose?.("single");
  // Handler para modo multi
  const handleMulti = () => onChoose?.("multi");

  // Interface do ecrã
  return (
    <View
      // Aplica a cor de fundo do tema
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Título sempre dentro de <Text> */}
      <Text style={[styles.title, { color: colors.text }]}>
        Bem-vindo ao jogo Tic Tac Toe (Jogo do Galo)
        Escolhe o modo de Jogo, tendo como opção dois modos.
      </Text>

      {/* Botão para "Um jogador" */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={handleSingle}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          Um jogador
        </Text>
      </TouchableOpacity>

      {/* Botão para "Dois jogadores" */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={handleMulti}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          Dois jogadores
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos minimalistas
const styles = StyleSheet.create({
  container: {
    flex: 1,                 // ocupa toda a tela
    alignItems: "center",    // centraliza horizontalmente
    justifyContent: "center",// centraliza verticalmente
    padding: 16,             // espaçamento interno
  },
  title: {
    fontSize: 20,            // tamanho do título
    fontWeight: "700",       // peso do título
    marginBottom: 24,        // espaço abaixo do título
  },
  button: {
    borderWidth: 1,          // borda do botão
    borderRadius: 10,        // cantos arredondados
    paddingHorizontal: 16,   // espaçamento interno lateral
    paddingVertical: 12,     // espaçamento interno vertical
    marginVertical: 8,       // espaço entre botões
    minWidth: 200,           // largura mínima do botão
    alignItems: "center",    // centraliza o texto
  },
  buttonText: {
    fontSize: 16,            // tamanho do texto do botão
    fontWeight: "600",       // peso do texto do botão
  },
});
