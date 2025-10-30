// src/components/SettingsModal.tsx

// Importa React
import React from "react";
// Importa componentes do React Native (Modal é o principal aqui)
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Importa o hook do tema global para aplicar cores
import { useTheme } from "../theme/Theme";

// Define as props aceitas pelo modal de definições
type Props = {
  visible: boolean; // controla visibilidade do modal (true/false)
  onClose: () => void; // fecha o modal
  onToggleTheme: () => void; // alterna o tema global (light/dark)
  onResetGame: () => void; // reinicia o jogo atual
  onOpenStats: () => void; // abre a tela de estatísticas
  darkMode?: boolean; // (opcional; o componente já pega este valor do useTheme)
};

// Componente de modal de definições
export default function SettingsModal({
  visible,
  onClose,
  onToggleTheme,
  onResetGame,
  onOpenStats,
}: Props) {
  // Obtém cores e estado de tema (darkMode) diretamente do hook useTheme
  const { colors, darkMode } = useTheme(); //

  // Renderiza o modal
  return (
    <Modal
      visible={visible} // mostra ou esconde
      animationType="fade" // animação de fade (suave)
      transparent // permite ver o ecrã de jogo por baixo (com overlay escuro)
      onRequestClose={onClose} // trata o botão "Voltar" físico do Android
    >
      {/* Overlay escurecido (fundo) */}
      <View style={styles.overlay}>
        {/* Painel central com opções */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Título do painel */}
          <Text style={[styles.title, { color: colors.text }]}>Definições</Text>

          {/* Opção para alternar tema */}
          <TouchableOpacity style={styles.item} onPress={onToggleTheme}>
            <Text style={[styles.itemText, { color: colors.text }]}>
              {/* Mostra o estado atual e a ação */}
              Tema: {darkMode ? "Escuro" : "Claro"} (alternar)
            </Text>
          </TouchableOpacity>

          {/* Opção para ver estatísticas */}
          <TouchableOpacity style={styles.item} onPress={onOpenStats}>
            <Text style={[styles.itemText, { color: colors.text }]}>Ver estatísticas</Text>
          </TouchableOpacity>

          {/* Opção para reiniciar o jogo */}
          <TouchableOpacity style={styles.item} onPress={onResetGame}>
            <Text style={[styles.itemText, { color: colors.text }]}>Reiniciar jogo</Text>
          </TouchableOpacity>

          {/* Botão de fechar o modal */}
          <TouchableOpacity style={[styles.item, styles.close]} onPress={onClose}>
            <Text style={[styles.itemText, { color: colors.text }]}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Estilos do modal
const styles = StyleSheet.create({
  overlay: {
    flex: 1, // ocupa a tela inteira
    backgroundColor: "rgba(0,0,0,0.5)", // escurece o fundo (preto com 50% opacidade)
    alignItems: "center", // centraliza horizontalmente
    justifyContent: "center", // centraliza verticalmente
    padding: 16, // margem interna
  },
  panel: {
    width: "100%", // ocupa toda a largura disponível
    maxWidth: 360, // limita a largura máxima (bom para tablets)
    borderWidth: 1, // borda do painel
    borderRadius: 12, // cantos arredondados
    paddingVertical: 12, // espaçamento interno vertical
  },
  title: {
    fontSize: 18, // tamanho do título
    fontWeight: "600", // peso do título
    paddingHorizontal: 16, // espaçamento lateral
    paddingVertical: 8, // espaçamento vertical
  },
  item: {
    paddingHorizontal: 16, // espaçamento lateral
    paddingVertical: 14, // espaçamento vertical
    borderTopWidth: 1, // divisor superior entre itens
    borderTopColor: "rgba(0,0,0,0.06)", // cor do divisor (quase invisível no modo escuro, ok)
  },
  itemText: {
    fontSize: 16, // tamanho do texto do item
  },
  close: {
    marginTop: 4 // pequena margem superior no botão fechar
  },
});