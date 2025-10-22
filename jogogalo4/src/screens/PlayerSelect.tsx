// src/screens/PlayerSelect.tsx

// Importa React e hook de estado
import React, { useState } from "react";
// Importa componentes do React Native
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
// Importa tema global
import { useTheme } from "../theme/Theme";

// Props esperadas
type Props = {
  onStart: () => void; // inicia o jogo
  onBack: () => void;  // volta ao menu
};

// Componente do ecrã de nomes para dois jogadores
export default function PlayerSelect({ onStart, onBack }: Props) {
  // Obtém paleta do tema atual
  const { colors } = useTheme();

  // Estado dos nomes
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");

  // Handler para iniciar o jogo
  const handleStart = () => {
    // Se quiseres, podes validar: if (!p1.trim() || !p2.trim()) return;
    onStart();
  };

  // Render com ajuste ao teclado no iOS
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Dois jogadores</Text>

        <Text style={[styles.label, { color: colors.text }]}>Nome do Jogador 1</Text>
        <TextInput
          value={p1}
          onChangeText={setP1}
          placeholder="Jogador 1"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
          ]}
        />

        <Text style={[styles.label, { color: colors.text }]}>Nome do Jogador 2</Text>
        <TextInput
          value={p2}
          onChangeText={setP2}
          placeholder="Jogador 2"
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.card, borderColor: colors.border },
          ]}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={onBack}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>
          </TouchableOpacity>

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
  flex: { flex: 1 },                              // ocupa ecrã inteiro
  container: { flex: 1, padding: 16, justifyContent: "center" }, // centralizado
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },  // título
  label: { fontSize: 14, marginBottom: 6 },                       // rótulo
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 16 }, // input
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },       // linha de botões
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }, // botão
  buttonText: { fontSize: 14, fontWeight: "700" },                // texto do botão
});
