// Importa React e o hook useState para gerir o estado local do input
import React, { useState } from "react";

// Importa componentes básicos do React Native
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

// Declaração das propriedades (props) que este componente recebe do App
type SinglePlayerProps = {
  onStart: (name: string) => void; // função chamada ao iniciar o jogo (envia o nome do jogador)
  onBack: () => void;              // função chamada ao voltar para o menu
  darkMode: boolean;               // indica se o modo escuro está ativo
};

// Componente principal da tela "Single Player"
export default function SinglePlayer({ onStart, onBack, darkMode }: SinglePlayerProps) {
  // Estado local para armazenar o nome do jogador
  const [player, setPlayer] = useState("");

  // Define cores dinâmicas com base no tema atual (claro ou escuro)
  const backgroundColor = darkMode ? "#121212" : "#FFFFFF"; // fundo
  const textColor = darkMode ? "#FFFFFF" : "#000000";       // texto
  const inputBg = darkMode ? "#1E1E1E" : "#F0F0F0";         // campo de input
  const buttonBg = darkMode ? "#444" : "#007bff";           // botão

  // Função chamada ao pressionar o botão "Começar"
  const handleStart = () => {
    const trimmed = player.trim(); // remove espaços extras
    if (!trimmed) return;          // se o campo estiver vazio, não faz nada
    onStart(trimmed);              // envia o nome para o componente principal (App.tsx)
  };

  // Renderização da interface do utilizador
  return (
    // Container principal com cor de fundo dependente do tema
    <View style={[styles.container, { backgroundColor }]}>
      {/* Botão de voltar no canto superior esquerdo */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: textColor }]}>← Voltar</Text>
      </TouchableOpacity>

      {/* Título da tela */}
      <Text style={[styles.title, { color: textColor }]}>Single Player</Text>

      {/* Campo de texto para digitar o nome */}
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
        placeholder="O teu nome"
        placeholderTextColor={darkMode ? "#AAA" : "#555"} // muda cor do placeholder conforme o tema
        value={player}                  // valor atual do input
        onChangeText={setPlayer}        // atualiza estado quando o utilizador digita
      />

      {/* Botão para começar o jogo */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBg }]}
        onPress={handleStart}
      >
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos da interface
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa todo o ecrã
    justifyContent: "center", // centra verticalmente
    alignItems: "center", // centra horizontalmente
    padding: 24, // espaçamento interno
  },
  backButton: {
    position: "absolute", // fixa o botão no topo
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 18,
  },
  title: {
    fontSize: 28, // título grande
    fontWeight: "bold", // negrito
    marginBottom: 20, // espaço abaixo do título
  },
  input: {
    width: "80%", // largura do campo
    padding: 12, // altura
    borderRadius: 8, // cantos arredondados
    marginBottom: 20, // espaço abaixo
  },
  button: {
    width: "60%",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff", // texto branco no botão
    textAlign: "center", // centraliza texto
    fontWeight: "bold",
    fontSize: 16,
  },
});
