// Importa React (para JSX e lógica de componente)
import React from "react";
// Importa componentes básicos do React Native
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

// Declaração do tipo das propriedades (props) recebidas do App
type ModeSelectProps = {
  onChoose: (mode: "single" | "multi") => void; // Função que escolhe o modo de jogo
  darkMode: boolean;                            // Indica se o modo escuro está ativo
  onToggleTheme: () => void;                    // Função que alterna entre claro e escuro
};

// Componente principal da tela de seleção de modo
export default function ModeSelect({
  onChoose,       // função chamada ao clicar em "single" ou "multi"
  darkMode,       // estado do tema atual
  onToggleTheme,  // função para alternar o tema
}: ModeSelectProps) {
  // Define cores de fundo, texto e botões com base no tema ativo
  const background = darkMode ? "#121212" : "#FFFFFF"; // fundo escuro ou claro
  const textColor = darkMode ? "#FFFFFF" : "#000000";  // cor do texto
  const buttonColor = darkMode ? "#444" : "#007bff";   // cor dos botões

  // Renderização da interface do menu
  return (
    <View style={[styles.container, { backgroundColor: background }]}>
      {/* Título principal */}
      <Text style={[styles.title, { color: textColor }]}>
        Escolhe o modo de jogo
      </Text>

      {/* Botão para jogar sozinho */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={() => onChoose("single")} // ao clicar, muda o modo para single
      >
        <Text style={styles.buttonText}>Jogar Sozinho</Text>
      </TouchableOpacity>

      {/* Botão para jogar a dois (multiplayer local) */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonColor }]}
        onPress={() => onChoose("multi")} // ao clicar, muda o modo para multi
      >
        <Text style={styles.buttonText}>Multiplayer Local</Text>
      </TouchableOpacity>

      {/* Botão adicional para alternar o tema (claro/escuro) */}
      <TouchableOpacity
        style={[styles.toggle, { borderColor: textColor }]} // muda cor da borda conforme tema
        onPress={onToggleTheme} // alterna o tema ao clicar
      >
        <Text style={[styles.toggleText, { color: textColor }]}>
          {darkMode ? "Modo Claro" : "Modo Escuro"} {/* texto muda conforme tema atual */}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos visuais do ecrã
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,                      // ocupa todo o ecrã
    justifyContent: "center",     // centra verticalmente
    alignItems: "center",         // centra horizontalmente
    padding: 24,                  // espaçamento interno
  },
  title: {
    fontSize: 22,                 // tamanho do título
    fontWeight: "bold",           // negrito
    marginBottom: 30,             // espaço abaixo do título
  },
  button: {
    width: "70%",                 // largura dos botões
    padding: 15,                  // altura dos botões
    borderRadius: 10,             // cantos arredondados
    marginBottom: 15,             // espaço entre botões
  },
  buttonText: {
    color: "#fff",                // texto branco dentro dos botões
    textAlign: "center",          // centraliza texto
    fontWeight: "bold",           // negrito
  },
  toggle: {
    marginTop: 30,                // distância do topo
    borderWidth: 1,               // contorno visível
    padding: 10,                  // espaçamento interno
    borderRadius: 10,             // cantos arredondados
  },
  toggleText: {
    fontSize: 16,                 // tamanho do texto
    textAlign: "center",          // centraliza
  },
});
