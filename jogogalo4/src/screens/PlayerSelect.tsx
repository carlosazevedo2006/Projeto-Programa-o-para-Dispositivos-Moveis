// src/screens/PlayerSelect.tsx

// Importa React e hook de estado
import React, { useState } from "react";
// Importa componentes do React Native
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
// Importa tema global
import { useTheme } from "../theme/Theme"; //

// Props esperadas (vindas do App.tsx)
type Props = {
  onStart: () => void; // inicia o jogo
  onBack: () => void; // volta ao menu
};

// Componente do ecrã de nomes para dois jogadores
export default function PlayerSelect({ onStart, onBack }: Props) {
  // Obtém paleta do tema atual
  const { colors } = useTheme();

  // Estado dos nomes (opcional, o jogo funciona sem eles, mas podiam ser usados no ecrã Game)
  const [p1, setP1] = useState(""); // nome do jogador 1 (X)
  const [p2, setP2] = useState(""); // nome do jogador 2 (O)

  // Handler para iniciar o jogo
  const handleStart = () => {
    // (Poderia haver validação aqui: if (!p1.trim() || !p2.trim()) return;)
    onStart(); // Chama a função do App.tsx para navegar para o jogo
  };

  // KeyboardAvoidingView ajusta a UI (com 'padding') quando o teclado aparece no iOS
  return (
    <KeyboardAvoidingView
      // 'padding' no iOS, 'undefined' (default) no Android
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      {/* O container principal */}
      <View style={styles.container}>
        {/* Título */}
        <Text style={[styles.title, { color: colors.text }]}>Dois jogadores</Text>

        {/* Rótulo e Input para Jogador 1 */}
        <Text style={[styles.label, { color: colors.text }]}>Nome do Jogador 1 (X)</Text>
        <TextInput
          value={p1} // valor controlado pelo estado
          onChangeText={setP1} // atualiza o estado
          placeholder="Jogador 1" // texto cinzento quando vazio
          placeholderTextColor={colors.muted} // cor do placeholder vinda do tema
          style={[
            styles.input, // estilo base
            // cores do tema para o input
            { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
          ]}
        />

        {/* Rótulo e Input para Jogador 2 */}
        <Text style={[styles.label, { color: colors.text }]}>Nome do Jogador 2 (O)</Text>
        <TextInput
          value={p2} // valor controlado pelo estado
          onChangeText={setP2} // atualiza o estado
          placeholder="Jogador 2" // placeholder
          placeholderTextColor={colors.muted} // cor do placeholder
          style={[
            styles.input, // estilo base
            { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
          ]}
        />

        {/* Botões de ação */}
        <View style={styles.actions}>
          {/* Botão Voltar */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onBack}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>
          </TouchableOpacity>

          {/* Botão Começar */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleStart}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Começar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Estilos
const styles = StyleSheet.create({
  flex: { flex: 1 }, // ocupa ecrã inteiro (necessário para o KeyboardAvoidingView)
  container: { flex: 1, padding: 16, justifyContent: "center" }, // centralizado
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 }, // título
  label: { fontSize: 14, marginBottom: 6 }, // rótulo
  input: { 
    borderWidth: 1, 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 16, 
    marginBottom: 16 
  }, // input
  actions: { flexDirection: "row", gap: 12, marginTop: 8 }, // linha de botões
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }, // botão
  buttonText: { fontSize: 14, fontWeight: "700" }, // texto do botão
});