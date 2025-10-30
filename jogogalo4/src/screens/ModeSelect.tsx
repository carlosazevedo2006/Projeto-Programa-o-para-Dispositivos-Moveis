// src/screens/ModeSelect.tsx
// ---------------------------------------------------------------
// Ecrã de seleção de modo: Singleplayer (um jogador) ou Multiplayer.
// Aplica o tema global e adiciona boas práticas de acessibilidade.
// ---------------------------------------------------------------

// Importa React
import React from "react";
// Importa componentes do React Native
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
// Importa o hook de tema para aplicar cores globais
import { useTheme } from "../theme/Theme";



// Define a tipagem das propriedades esperadas
type ModeSelectProps = {
  // Callback chamado quando o utilizador escolhe um modo
  onChoose?: (mode: "single" | "multi") => void;
};

// Componente de seleção de modo
export default function ModeSelect({ onChoose }: ModeSelectProps) {
  // Obtém as cores do tema global (respeita modo claro/escuro)
  const { colors } = useTheme();

  // Handler para modo single
  const handleSingle = () => onChoose?.("single");
  // Handler para modo multi
  const handleMulti = () => onChoose?.("multi");

  // Interface do ecrã
  return (
    // Container principal com a cor de fundo do tema
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Wrapper para limitar a largura do conteúdo e melhorar legibilidade */}
      <View style={styles.centerCol}>
        {/* Título e descrição — sempre dentro de <Text> */}
        <Text style={[styles.title, { color: colors.text }]}>
          Jogo do Galo
        </Text>

        {/* Descrição breve do que fazer neste ecrã */}
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Escolhe o modo de jogo.
        </Text>

        <Text style={[styles.subtitle, { color: colors.text}]}>
          Tens o modo singleplayer e multiplayer. É só escolheres.
        </Text>

        {/* Botão para "Um jogador" */}
        <TouchableOpacity
          // Estilo visual do botão, totalmente baseado no tema
          style={[
            styles.button,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          // Ação ao clicar
          onPress={handleSingle}
          // Acessibilidade: indica que é um botão
          accessibilityRole="button"
          // Acessibilidade: label claro e curto
          accessibilityLabel="Modo um jogador"
          // Acessibilidade: dica sobre o que irá acontecer
          accessibilityHint="Abre o modo singleplayer com bot."
          // Pequeno feedback visual nativo
          activeOpacity={0.8}
        >
          {/* Texto do botão */}
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
          accessibilityRole="button"
          accessibilityLabel="Modo dois jogadores"
          accessibilityHint="Abre o modo multiplayer local."
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Dois jogadores
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos minimalistas e responsivos
const styles = StyleSheet.create({
  // Ocupa o ecrã inteiro e centra o conteúdo
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16, // resguarda as margens em ecrãs pequenos
  },
  // Coluna central com largura máxima para boa legibilidade
  centerCol: {
    width: "100%",
    maxWidth: 360,          // limita o alargamento em tablets
    alignItems: "center",   // centra os elementos
  },
  // Título principal
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",   // garante boa leitura em várias larguras
  },
  // Subtítulo/descrição
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 24,
    textAlign: "center",
  },
  // Botão base
  button: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginVertical: 8,     // espaço entre botões
    minWidth: 200,
    alignItems: "center",
  },
  // Texto dos botões
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
