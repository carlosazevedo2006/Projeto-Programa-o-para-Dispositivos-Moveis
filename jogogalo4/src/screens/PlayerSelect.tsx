// Importa React e o hook useState para armazenar os nomes dos jogadores
import React, { useState } from "react";

// Importa componentes base do React Native
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

// Define as propriedades (props) recebidas do componente principal (App.tsx)
type PlayerSelectProps = {
  onStart: (players: string[]) => void; // Função chamada ao começar o jogo (recebe [p1, p2])
  onBack: () => void;                   // Função chamada ao clicar em "Voltar"
  darkMode: boolean;                    // Indica se o modo escuro está ativo
};

// Componente principal da tela de seleção de jogadores
export default function PlayerSelect({ onStart, onBack, darkMode }: PlayerSelectProps) {
  // Estados locais para armazenar o nome dos dois jogadores
  const [p1, setP1] = useState(""); // Jogador 1
  const [p2, setP2] = useState(""); // Jogador 2

  // Cores que se adaptam ao modo escuro/claro
  const backgroundColor = darkMode ? "#121212" : "#FFFFFF"; // fundo
  const textColor = darkMode ? "#FFFFFF" : "#000000";       // texto
  const inputBg = darkMode ? "#1E1E1E" : "#F0F0F0";         // input
  const buttonBg = darkMode ? "#444" : "#007bff";           // botão

  // Função chamada ao clicar no botão "Começar"
  const handleStart = () => {
    // Cria nomes padrão se algum estiver vazio
    const player1 = p1.trim() || "Jogador 1";
    const player2 = p2.trim() || "Jogador 2";
    // Chama o callback enviado pelo App e envia os dois nomes
    onStart([player1, player2]);
  };

  // Renderização da interface da tela
  return (
    // Container principal
    <View style={[styles.container, { backgroundColor }]}>
      {/* Botão de voltar no topo esquerdo */}
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backText, { color: textColor }]}>← Voltar</Text>
      </TouchableOpacity>

      {/* Título principal */}
      <Text style={[styles.title, { color: textColor }]}>Modo 2 Jogadores</Text>

      {/* Campo de texto para o Jogador 1 */}
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
        placeholder="Nome do Jogador 1"
        placeholderTextColor={darkMode ? "#AAA" : "#555"}
        value={p1}
        onChangeText={setP1} // atualiza o estado p1 conforme o utilizador digita
      />

      {/* Campo de texto para o Jogador 2 */}
      <TextInput
        style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
        placeholder="Nome do Jogador 2"
        placeholderTextColor={darkMode ? "#AAA" : "#555"}
        value={p2}
        onChangeText={setP2} // atualiza o estado p2 conforme o utilizador digita
      />

      {/* Botão de começar o jogo */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: buttonBg }]}
        onPress={handleStart} // chama handleStart ao clicar
      >
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos visuais da interface
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa todo o ecrã
    justifyContent: "center", // centra verticalmente
    alignItems: "center", // centra horizontalmente
    padding: 24, // espaçamento interno
  },
  backButton: {
    position: "absolute", // fixa o botão no topo esquerdo
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 18,
  },
  title: {
    fontSize: 26, // título grande
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    width: "60%",
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff", // texto branco dentro do botão
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
