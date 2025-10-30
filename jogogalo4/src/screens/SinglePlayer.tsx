// src/screens/SinglePlayer.tsx

// Importa React e o hook de estado
import React, { useState } from "react"; // useState para guardar seleções do utilizador
// Importa componentes base do React Native
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"; // UI e interações
// Importa o tema global (para cores e modo escuro)
import { useTheme } from "../theme/Theme"; // hook que expõe cores do tema
// Importa o tipo de dificuldade usado no resto da app/IA
import type { BotDifficulty } from "../ai/bot"; // "easy" | "medium" | "hard"

// Define o formato das props deste ecrã
type Props = {
  // Será chamado quando o utilizador confirmar as escolhas
  onChoose: (payload: { mark: "X" | "O"; difficulty: BotDifficulty }) => void;
  // Voltar ao menu anterior
  onBack: () => void;
};

// Componente do ecrã de configuração do singleplayer
export default function SinglePlayer({ onChoose, onBack }: Props) {
  // Obtém a paleta de cores atual via tema (respeita modo claro/escuro)
  const { colors } = useTheme();

  // Guarda localmente a seleção do símbolo do humano: "X" começa; "O" deixa o bot (X) começar
  const [mark, setMark] = useState<"X" | "O" | null>(null);
  // Guarda localmente a dificuldade: por omissão "medium"
  const [difficulty, setDifficulty] = useState<BotDifficulty>("medium");

  // Ao carregar em "Começar", valida e envia as escolhas ao App
  const handleStart = () => {
    // Se ainda não escolheu símbolo, não avança
    if (!mark) return;
    // Devolve as escolhas para o App decidir e navegar para o Jogo
    onChoose({ mark, difficulty });
  };

  // Renderiza o ecrã
  return (
    // Container principal com fundo segundo o tema
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título do ecrã */}
      <Text style={[styles.title, { color: colors.text }]}>Singleplayer</Text>

      {/* Texto explicativo da convenção de início (X começa) */}
      <Text style={[styles.subtitle, { color: colors.text }]}>
        X começa o jogo. Se escolheres O, o bot (X) joga primeiro.
      </Text>

      {/* Secção para escolher o símbolo */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolhe o teu símbolo</Text>

      {/* Linha com dois cartões: X e O */}
      <View style={styles.row}>
        {/* Cartão para escolher X */}
        <TouchableOpacity
          onPress={() => setMark("X")} // ao tocar, guarda "X" como escolha
          style={[
            styles.card, // base do cartão
            { backgroundColor: colors.card, borderColor: colors.border }, // cores do tema
            mark === "X" && { borderColor: "#4f8cff" }, // realce quando selecionado
          ]}
          accessibilityRole="button" // semântica de botão
          accessibilityLabel="Escolher X" // etiqueta de acessibilidade
        >
          {/* Símbolo grande */}
          <Text style={[styles.mark, { color: colors.text }]}>X</Text>
          {/* Legendas */}
          <Text style={[styles.caption, { color: colors.text }]}>Cruz</Text>
          <Text style={[styles.note, { color: colors.muted }]}>Começas primeiro</Text>
        </TouchableOpacity>

        {/* Cartão para escolher O */}
        <TouchableOpacity
          onPress={() => setMark("O")} // ao tocar, guarda "O" como escolha
          style={[
            styles.card, // base do cartão
            { backgroundColor: colors.card, borderColor: colors.border }, // cores do tema
            mark === "O" && { borderColor: "#4f8cff" }, // realce quando selecionado
          ]}
          accessibilityRole="button" // semântica de botão
          accessibilityLabel="Escolher O" // etiqueta de acessibilidade
        >
          {/* Símbolo grande */}
          <Text style={[styles.mark, { color: colors.text }]}>O</Text>
          {/* Legendas */}
          <Text style={[styles.caption, { color: colors.text }]}>Círculo</Text>
          <Text style={[styles.note, { color: colors.muted }]}>Bot começa</Text>
        </TouchableOpacity>
      </View>

      {/* Secção para escolher a dificuldade do bot */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Dificuldade do bot</Text>

      {/* Linha com três “pílulas” de dificuldade */}
      <View style={styles.row}>
        {/* Fácil */}
        <TouchableOpacity
          onPress={() => setDifficulty("easy")} // define dificuldade como "easy"
          style={[
            styles.pill, // base do botão em forma de pílula
            { backgroundColor: colors.card, borderColor: colors.border }, // cores do tema
            difficulty === "easy" && { borderColor: "#4f8cff" }, // realce selecionado
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Fácil</Text>
        </TouchableOpacity>

        {/* Médio */}
        <TouchableOpacity
          onPress={() => setDifficulty("medium")} // define dificuldade como "medium"
          style={[
            styles.pill,
            { backgroundColor: colors.card, borderColor: colors.border },
            difficulty === "medium" && { borderColor: "#4f8cff" },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Médio</Text>
        </TouchableOpacity>

        {/* Difícil */}
        <TouchableOpacity
          onPress={() => setDifficulty("hard")} // define dificuldade como "hard"
          style={[
            styles.pill,
            { backgroundColor: colors.card, borderColor: colors.border },
            difficulty === "hard" && { borderColor: "#4f8cff" },
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Difícil</Text>
        </TouchableOpacity>
      </View>

      {/* Ações no fundo: Voltar e Começar */}
      <View style={styles.actions}>
        {/* Botão Voltar */}
        <TouchableOpacity
          style={[
            styles.button, // estilo base de botão
            { backgroundColor: colors.card, borderColor: colors.border }, // cores do tema
          ]}
          onPress={onBack} // ao tocar, volta ao menu de modos
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>
        </TouchableOpacity>

        {/* Botão Começar (desativado enquanto não escolher símbolo) */}
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.card, borderColor: colors.border },
            !mark && { opacity: 0.5 }, // feedback visual quando desativado
          ]}
          onPress={handleStart} // confirma e segue para o jogo
          disabled={!mark} // bloqueia interação sem símbolo escolhido
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Começar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos do ecrã
const styles = StyleSheet.create({
  // Container raiz
  container: {
    flex: 1,                 // ocupa todo o ecrã
    padding: 16,             // espaçamento interno
    justifyContent: "center",// centra verticalmente
  },
  // Título principal
  title: {
    fontSize: 22,            // tamanho do título
    fontWeight: "700",       // destaque
    marginBottom: 8,         // espaço abaixo
  },
  // Texto explicativo
  subtitle: {
    fontSize: 14,            // tamanho do texto
    marginBottom: 16,        // espaço abaixo
  },
  // Título de secções ("Escolhe o teu símbolo", "Dificuldade…")
  sectionTitle: {
    fontSize: 16,            // tamanho do título de secção
    fontWeight: "700",       // destaque
    marginBottom: 8,         // espaço abaixo
  },
  // Linha genérica com elementos lado a lado
  row: {
    flexDirection: "row",    // coloca filhos na horizontal
    gap: 12,                 // espaço entre elementos (se RN não suportar, substituir por margens)
    marginBottom: 16,        // espaço abaixo desta linha
  },
  // Cartões de seleção de símbolo
  card: {
    flex: 1,                 // divide o espaço igualmente (X e O)
    borderWidth: 1,          // borda visível
    borderRadius: 12,        // cantos arredondados
    paddingVertical: 18,     // espaçamento interno vertical
    alignItems: "center",    // centra conteúdo na horizontal
  },
  // Símbolo X/O grande
  mark: {
    fontSize: 42,            // tamanho do X/O
    fontWeight: "800",       // destaque
    marginBottom: 8,         // espaço abaixo
  },
  // Legenda abaixo do símbolo
  caption: {
    fontSize: 16,            // tamanho do texto
    fontWeight: "600",       // leve destaque
  },
  // Nota informativa (quem começa)
  note: {
    fontSize: 12,            // tamanho pequeno
    marginTop: 4,            // espaço acima
  },
  // Botão tipo “pílula” para dificuldades
  pill: {
    flex: 1,                 // cada pílula ocupa um terço da linha
    borderWidth: 1,          // borda
    borderRadius: 999,       // formato totalmente arredondado
    paddingVertical: 10,     // espaçamento vertical
    alignItems: "center",    // centra rótulo
  },
  // Texto dentro das pílulas
  pillText: {
    fontSize: 14,            // tamanho do texto
    fontWeight: "700",       // destaque
  },
  // Área das ações finais
  actions: {
    flexDirection: "row",    // botões lado a lado
    gap: 12,                 // espaço entre botões
    marginTop: 8,            // espaço acima
  },
  // Botão base
  button: {
    borderWidth: 1,          // borda
    borderRadius: 10,        // cantos arredondados
    paddingHorizontal: 16,   // espaçamento horizontal interno
    paddingVertical: 10,     // espaçamento vertical interno
  },
  // Texto dos botões
  buttonText: {
    fontSize: 14,            // tamanho do texto
    fontWeight: "700",       // peso
  },
});
