// src/screens/SinglePlayer.tsx

// Importa React e hook de estado
import React, { useState } from "react";
// Importa componentes do React Native
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// Importa tema global
import { useTheme } from "../theme/Theme";

// Define as props que este ecrã expõe
type Props = {
  onChooseMark: (mark: "X" | "O") => void; // chamado quando o utilizador escolhe X ou O
  onBack: () => void;                      // voltar ao menu anterior
};

// Ecrã de configuração do singleplayer: escolher ser X ou O
export default function SinglePlayer({ onChooseMark, onBack }: Props) {
  // Obtém paleta de cores do tema atual
  const { colors } = useTheme();

  // Estado local para destacar visualmente a seleção atual
  const [selected, setSelected] = useState<"X" | "O" | null>(null);

  // Handler para escolher o símbolo
  const choose = (m: "X" | "O") => {
    setSelected(m);      // atualiza destaque imediato no UI
    onChooseMark(m);     // informa o App da escolha e segue o fluxo do jogo
  };

  // Interface: texto explicativo e dois cartões de escolha
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título do ecrã */}
      <Text style={[styles.title, { color: colors.text }]}>Escolhe o teu símbolo</Text>

      {/* Explicação da convenção de quem começa */}
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Se escolheres X começas o jogo. Se escolheres O, o bot (X) joga primeiro.
      </Text>

      {/* Área das opções */}
      <View style={styles.row}>
        {/* Opção: ser X */}
        <TouchableOpacity
          onPress={() => choose("X")}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            selected === "X" && { borderColor: "#4f8cff" }, // realce simples
          ]}
          accessibilityRole="button"
          accessibilityLabel="Escolher X"
        >
          <Text style={[styles.mark, { color: colors.text }]}>X</Text>
          <Text style={[styles.caption, { color: colors.text }]}>Cruz</Text>
          <Text style={[styles.note, { color: colors.muted }]}>Começas primeiro</Text>
        </TouchableOpacity>

        {/* Opção: ser O */}
        <TouchableOpacity
          onPress={() => choose("O")}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
            selected === "O" && { borderColor: "#4f8cff" }, // realce simples
          ]}
          accessibilityRole="button"
          accessibilityLabel="Escolher O"
        >
          <Text style={[styles.mark, { color: colors.text }]}>O</Text>
          <Text style={[styles.caption, { color: colors.text }]}>Círculo</Text>
          <Text style={[styles.note, { color: colors.muted }]}>O Bot começa</Text>
        </TouchableOpacity>
      </View>

      {/* Botão para voltar atrás, caso o utilizador mude de ideias */}
      <TouchableOpacity
        style={[
          styles.backBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={onBack}
      >
        <Text style={[styles.backText, { color: colors.text }]}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos do ecrã
const styles = StyleSheet.create({
  container: {
    flex: 1,                 // ocupa ecrã inteiro
    padding: 16,             // espaçamento interno
    justifyContent: "center",// centra verticalmente
  },
  title: {
    fontSize: 22,            // tamanho do título
    fontWeight: "700",       // destaque do título
    marginBottom: 8,         // espaçamento inferior
  },
  subtitle: {
    fontSize: 14,            // tamanho do texto informativo
    marginBottom: 16,        // espaçamento inferior
  },
  row: {
    flexDirection: "row",    // opções lado a lado
    gap: 12,                 // espaço entre cartões (se RN antigo avisar, use marginRight)
    marginBottom: 20,        // espaçamento inferior
  },
  card: {
    flex: 1,                 // divide espaço igualmente
    borderWidth: 1,          // borda visível
    borderRadius: 12,        // cantos arredondados
    paddingVertical: 18,     // espaçamento interno vertical
    alignItems: "center",    // centra conteúdo horizontalmente
  },
  mark: {
    fontSize: 42,            // tamanho do X/O
    fontWeight: "800",       // destaque do símbolo
    marginBottom: 8,         // espaçamento inferior
  },
  caption: {
    fontSize: 16,            // legenda do símbolo
    fontWeight: "600",       // leve destaque
  },
  note: {
    fontSize: 12,            // observação
    marginTop: 4,            // espaçamento superior
  },
  backBtn: {
    alignSelf: "center",     // centraliza botão
    borderWidth: 1,          // borda
    borderRadius: 10,        // cantos
    paddingHorizontal: 16,   // espaçamento horizontal
    paddingVertical: 10,     // espaçamento vertical
  },
  backText: {
    fontSize: 14,            // tamanho do texto do botão
    fontWeight: "700",       // peso do texto
  },
});
