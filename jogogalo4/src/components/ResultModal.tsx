// src/components/ResultModal.tsx

// Importa React
import React from "react";
// Importa componentes do React Native
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
// Importa o tema global para aplicar cores
import { useTheme } from "../theme/Theme";

// Define as props aceitas pelo modal de resultado
type Props = {
  visible: boolean; // controla se o modal está visível
  title: string; // título principal, por exemplo "Vitória do Jogador 1"
  message?: string; // mensagem secundária, por exemplo "Jogador 2 perdeu"
  onPlayAgain: () => void; // ação "Jogar de novo"
  onExitToMenu: () => void; // ação "Voltar ao menu"
  onClose?: () => void; // fechar o modal sem ação extra (opcional)
};

// Componente da janela de resultado
export default function ResultModal({
  visible,
  title,
  message,
  onPlayAgain,
  onExitToMenu,
  onClose,
}: Props) {
  // Obtém paleta de cores do tema atual
  const { colors } = useTheme(); //

  // Renderiza o modal
  return (
    <Modal
      visible={visible} // mostra/esconde
      animationType="fade" // animação simples
      transparent // overlay translúcido
      // Se onClose for fornecido, usa-o, senão, o botão 'Voltar' sai para o menu
      onRequestClose={onClose ?? onExitToMenu} // Android back button
    >
      {/* Overlay escuro atrás do painel */}
      <View style={styles.overlay}>
        {/* Painel central com o conteúdo */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Título (ex: "Ganhaste") */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

          {/* Mensagem opcional (ex: "O bot perdeu") */}
          {message ? (
            <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          ) : null}

          {/* Ações principais */}
          <View style={styles.actions}>
            {/* Botão Jogar de Novo */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={onPlayAgain}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Jogar de novo</Text>
            </TouchableOpacity>

            {/* Botão Voltar ao Menu */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={onExitToMenu}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>Voltar ao menu</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de fechar opcional (se a prop onClose for passada) */}
          {onClose ? (
            <TouchableOpacity
              style={[styles.close, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.closeText, { color: colors.text }]}>Fechar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

// Estilos do modal
const styles = StyleSheet.create({
  overlay: {
    flex: 1, // ocupa a tela toda
    backgroundColor: "rgba(0,0,0,0.5)", // escurece o fundo
    alignItems: "center", // centra horizontalmente
    justifyContent: "center", // centra verticalmente
    padding: 16, // respiro
  },
  panel: {
    width: "100%", // ocupa largura disponível
    maxWidth: 380, // limite de largura
    borderWidth: 1, // borda
    borderRadius: 12, // cantos arredondados
    padding: 16, // espaçamento interno
  },
  title: {
    fontSize: 20, // tamanho do título
    fontWeight: "700", // destaque no título
  },
  message: {
    fontSize: 14, // tamanho da mensagem
    marginTop: 8, // espaço acima
  },
  actions: {
    flexDirection: "row", // botões lado a lado
    gap: 12, // espaço entre botões (requer RN >= 0.71)
    marginTop: 16, // espaço acima
  },
  button: {
    flex: 1, // cada botão ocupa metade do espaço disponível
    borderWidth: 1, // borda do botão
    borderRadius: 10, // cantos arredondados
    paddingHorizontal: 12, // espaçamento interno lateral
    paddingVertical: 10, // espaçamento interno vertical
    alignItems: "center", // centra texto
  },
  buttonText: {
    fontSize: 14, // tamanho do texto do botão
    fontWeight: "700", // destaque
  },
  close: {
    marginTop: 10, // espaço acima
    alignSelf: "center", // centra botão
    borderWidth: 1, // borda
    borderRadius: 10, // cantos
    paddingHorizontal: 12, // espaçamento interno lateral
    paddingVertical: 8, // espaçamento interno vertical
  },
  closeText: {
    fontSize: 14, // tamanho do texto
    fontWeight: "600", // leve destaque
  },
});