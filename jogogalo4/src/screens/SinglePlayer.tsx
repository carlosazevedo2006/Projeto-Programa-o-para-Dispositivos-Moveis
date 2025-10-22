// src/screens/SinglePlayer.tsx

// Importa React e hooks
import React, { useState } from "react"; // useState para gerir seleção
// Importa componentes do React Native
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"; // UI básica
// Importa o tema global
import { useTheme } from "../theme/Theme"; // cores e paleta

// Tipo de dificuldade do bot
type BotDifficulty = "easy" | "medium" | "hard"; // três níveis

// Props do ecrã: devolve marca e dificuldade ao confirmar
type Props = {
  onChoose: (payload: { mark: "X" | "O"; difficulty: BotDifficulty }) => void; // callback com escolhas
  onBack: () => void;                                                            // voltar ao menu anterior
};

// Ecrã para escolher símbolo e dificuldade no singleplayer
export default function SinglePlayer({ onChoose, onBack }: Props) {
  // Obtém paleta de cores do tema
  const { colors } = useTheme(); // paleta para estilos

  // Estado para a marca escolhida pelo humano
  const [mark, setMark] = useState<"X" | "O" | null>(null); // null enquanto não escolhido
  // Estado para a dificuldade escolhida
  const [difficulty, setDifficulty] = useState<BotDifficulty>("medium"); // padrão "medium"

  // Handler para confirmar escolhas e avançar para o jogo
  const handleStart = () => {
    if (!mark) return;                               // se não escolheu marca, não avança
    onChoose({ mark, difficulty });                  // devolve marca e dificuldade ao App
  };

  // Renderização do ecrã
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título principal */}
      <Text style={[styles.title, { color: colors.text }]}>Singleplayer</Text>

      {/* Informação sobre quem começa */}
      <Text style={[styles.subtitle, { color: colors.text }]}>
        X começa o jogo. Se escolheres O, o bot (X) joga primeiro.
      </Text>

      {/* Secção de escolha da marca */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolhe o teu símbolo</Text>
      <View style={styles.row}>
        {/* Cartão para X */}
        <TouchableOpacity
          onPress={() => setMark("X")}                                                   // seleciona X
          style={[
            styles.card,                                                                 // base do cartão
            { backgroundColor: colors.card, borderColor: colors.border },                // cores do tema
            mark === "X" && { borderColor: "#4f8cff" },                                  // destaque se selecionado
          ]}
          accessibilityRole="button"                                                     // acessibilidade
          accessibilityLabel="Escolher X"                                                // descrição
        >
          <Text style={[styles.mark, { color: colors.text }]}>X</Text>                   // símbolo
          <Text style={[styles.caption, { color: colors.text }]}>Cruzes</Text>           // legenda
          <Text style={[styles.note, { color: colors.muted }]}>Começas primeiro</Text>   // observação
        </TouchableOpacity>

        {/* Cartão para O */}
        <TouchableOpacity
          onPress={() => setMark("O")}                                                   // seleciona O
          style={[
            styles.card,                                                                 // base do cartão
            { backgroundColor: colors.card, borderColor: colors.border },                // cores do tema
            mark === "O" && { borderColor: "#4f8cff" },                                  // destaque se selecionado
          ]}
          accessibilityRole="button"                                                     // acessibilidade
          accessibilityLabel="Escolher O"                                                // descrição
        >
          <Text style={[styles.mark, { color: colors.text }]}>O</Text>                   // símbolo
          <Text style={[styles.caption, { color: colors.text }]}>Círculos</Text>         // legenda
          <Text style={[styles.note, { color: colors.muted }]}>Bot começa</Text>         // observação
        </TouchableOpacity>
      </View>

      {/* Secção de escolha da dificuldade */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Dificuldade do bot</Text>
      <View style={styles.row}>
        {/* Botão fácil */}
        <TouchableOpacity
          onPress={() => setDifficulty("easy")}                                           // seleciona fácil
          style={[
            styles.pill,                                                                  // base do botão
            { backgroundColor: colors.card, borderColor: colors.border },                 // cores do tema
            difficulty === "easy" && { borderColor: "#4f8cff" },                          // destaque
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Fácil</Text>            // rótulo
        </TouchableOpacity>

        {/* Botão médio */}
        <TouchableOpacity
          onPress={() => setDifficulty("medium")}                                         // seleciona médio
          style={[
            styles.pill,                                                                  // base do botão
            { backgroundColor: colors.card, borderColor: colors.border },                 // cores do tema
            difficulty === "medium" && { borderColor: "#4f8cff" },                        // destaque
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Médio</Text>            // rótulo
        </TouchableOpacity>

        {/* Botão difícil */}
        <TouchableOpacity
          onPress={() => setDifficulty("hard")}                                           // seleciona difícil
          style={[
            styles.pill,                                                                  // base do botão
            { backgroundColor: colors.card, borderColor: colors.border },                 // cores do tema
            difficulty === "hard" && { borderColor: "#4f8cff" },                          // destaque
          ]}
        >
          <Text style={[styles.pillText, { color: colors.text }]}>Difícil</Text>          // rótulo
        </TouchableOpacity>
      </View>

      {/* Ações: voltar e começar */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]} // botão voltar
          onPress={onBack}                                                                      // volta ao menu
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>               // rótulo
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,                                                                       // botão começar
            { backgroundColor: colors.card, borderColor: colors.border },                        // cores
            !mark && { opacity: 0.5 },                                                           // desativa visualmente sem marca
          ]}
          onPress={handleStart}                                                                  // confirma escolhas
          disabled={!mark}                                                                       // desabilita sem marca
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Começar</Text>               // rótulo
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 16,            // título de secção
    fontWeight: "700",       // destaque
    marginBottom: 8,         // espaçamento inferior
  },
  row: {
    flexDirection: "row",    // elementos lado a lado
    gap: 12,                 // espaçamento entre elementos
    marginBottom: 16,        // espaçamento inferior do bloco
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
  pill: {
    flex: 1,                 // cada botão ocupa um terço da linha
    borderWidth: 1,          // borda
    borderRadius: 999,       // formato arredondado tipo pílula
    paddingVertical: 10,     // espaçamento interno vertical
    alignItems: "center",    // centra rótulo
  },
  pillText: {
    fontSize: 14,            // tamanho do texto do botão
    fontWeight: "700",       // destaque
  },
  actions: {
    flexDirection: "row",    // botões lado a lado
    gap: 12,                 // espaço entre botões
    marginTop: 8,            // espaço acima
  },
  button: {
    borderWidth: 1,          // borda do botão
    borderRadius: 10,        // cantos arredondados
    paddingHorizontal: 16,   // espaçamento horizontal interno
    paddingVertical: 10,     // espaçamento vertical interno
  },
  buttonText: {
    fontSize: 14,            // tamanho do texto do botão
    fontWeight: "700",       // peso do texto
  },
});
