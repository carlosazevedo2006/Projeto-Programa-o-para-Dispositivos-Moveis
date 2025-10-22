// src/screens/SinglePlayer.tsx

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

// Componente do ecrã de nome para singleplayer
export default function SinglePlayer({ onStart, onBack }: Props) {
  // Obtém a paleta de cores do tema atual
  const { colors } = useTheme();

  // Estado para o nome do jogador
  const [name, setName] = useState("");

  // Handler para iniciar
  const handleStart = () => {
    // Caso queiras validar: if (!name.trim()) return;
    onStart();
  };

  // Render com ajuste ao teclado no iOS
  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={[styles.flex, { backgroundColor: colors.background }]}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Jogador</Text>

        <Text style={[styles.label, { color: colors.text }]}>O teu nome</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Escreve o teu nome"
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
  flex: { flex: 1 },                              // ocupa ecrã todo
  container: { flex: 1, padding: 16, justifyContent: "center" }, // layout centralizado
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },  // título
  label: { fontSize: 14, marginBottom: 6 },                       // rótulo
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, marginBottom: 16 }, // input
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },       // linha de botões
  button: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 }, // botão
  buttonText: { fontSize: 14, fontWeight: "700" },                // texto do botão
});
