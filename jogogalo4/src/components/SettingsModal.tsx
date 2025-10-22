// src/components/SettingsModal.tsx

// Importa React
import React from "react";
// Importa componentes do React Native
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Importa o hook do tema global
import { useTheme } from "../theme/Theme";

// Define as props aceitas pelo modal de definições
type Props = {
  visible: boolean;          // controla visibilidade do modal
  onClose: () => void;       // fecha o modal
  onToggleTheme: () => void; // alterna o tema global
  onResetGame: () => void;   // reinicia o jogo atual
  onOpenStats: () => void;   // abre a tela de estatísticas
  darkMode?: boolean;        // opcional; rótulo pega do contexto
};

// Componente de modal de definições
export default function SettingsModal({
  visible,
  onClose,
  onToggleTheme,
  onResetGame,
  onOpenStats,
}: Props) {
  // Obtém cores e estado de tema
  const { colors, darkMode } = useTheme();

  // Renderiza o modal
  return (
    <Modal
      visible={visible}       // mostra ou esconde
      animationType="fade"    // animação de fade
      transparent             // permite overlay escuro personalizado
      onRequestClose={onClose}// trata botão voltar do Android
    >
      {/* Overlay escurecido atrás do painel */}
      <View style={styles.overlay}>
        {/* Painel central com opções */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Título do painel */}
          <Text style={[styles.title, { color: colors.text }]}>Definições</Text>

          {/* Opção para alternar tema */}
          <TouchableOpacity style={styles.item} onPress={onToggleTheme}>
            <Text style={[styles.itemText, { color: colors.text }]}>
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
    flex: 1,                             // ocupa a tela inteira
    backgroundColor: "rgba(0,0,0,0.5)",  // escurece o fundo
    alignItems: "center",                // centraliza horizontalmente
    justifyContent: "center",            // centraliza verticalmente
    padding: 16,                         // margem interna
  },
  panel: {
    width: "100%",                       // ocupa toda a largura disponível
    maxWidth: 360,                       // limita a largura máxima
    borderWidth: 1,                      // borda do painel
    borderRadius: 12,                    // cantos arredondados
    paddingVertical: 12,                 // espaçamento interno vertical
  },
  title: {
    fontSize: 18,                        // tamanho do título
    fontWeight: "600",                   // peso do título
    paddingHorizontal: 16,               // espaçamento lateral
    paddingVertical: 8,                  // espaçamento vertical
  },
  item: {
    paddingHorizontal: 16,               // espaçamento lateral
    paddingVertical: 14,                 // espaçamento vertical
    borderTopWidth: 1,                   // divisor superior entre itens
    borderTopColor: "rgba(0,0,0,0.06)",  // cor do divisor
  },
  itemText: {
    fontSize: 16,                        // tamanho do texto do item
  },
  close: { marginTop: 4 },               // pequena margem superior no botão fechar
});
