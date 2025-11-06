// src/components/SettingsButton.tsx
// =============================================================
// COMPONENTE: BOTÃO DE DEFINIÇÕES FLUTUANTE
// POSIÇÃO: INFERIOR ESQUERDA (Não interfere com o conteúdo do jogo)
// VERSÃO: ATUALIZADA COM NOVA POSIÇÃO VERTICAL
// =============================================================

// Importa React para criar componentes
import React from "react";
// Importa componentes do React Native
import { 
  TouchableOpacity,   // Botão sensível ao toque com feedback visual
  Text,               // Componente para exibir texto
  StyleSheet,         // API para criar estilos
  SafeAreaView,       // Garante que o conteúdo não sobreponha áreas especiais (notch, etc.)
  Platform            // Detecta a plataforma (iOS, Android, Web) para ajustes específicos
} from "react-native";
// Importa o hook do tema para cores consistentes
import { useTheme } from "../theme/Theme";

// =============================================================
// DEFINIÇÃO DAS PROPRIEDADES (PROPS) DO COMPONENTE
// =============================================================
type Props = {
  // Função que será chamada quando o botão for pressionado
  onPress: () => void;
};

// =============================================================
// COMPONENTE PRINCIPAL - SETTINGS BUTTON
// =============================================================
export default function SettingsButton({ onPress }: Props) {
  // Obtém o objeto de cores do tema atual (modo claro/escuro)
  const { colors } = useTheme();

  // =============================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // =============================================================
  return (
    /**
     * SafeAreaView garante que o botão não fique sobreposto a:
     * - Notch (iPhone)
     * - Barra de status
     * - Barras de gestos
     * - Áreas inseguras do dispositivo
     */
    <SafeAreaView style={styles.safeAreaContainer}>
      
      {/**
       * TouchableOpacity - Botão com efeito visual de opacidade ao ser pressionado
       * 
       * Características:
       * - Feedback visual automático (opacidade reduz para 0.7 quando pressionado)
       * - Acessibilidade nativa
       * - Fácil customização
       */}
      <TouchableOpacity
        // =============================================================
        // ESTILOS DINÂMICOS DO BOTÃO
        // =============================================================
        style={[
          styles.button, // Estilos base fixos
          { 
            // CORES DINÂMICAS BASEADAS NO TEMA:
            backgroundColor: colors.primary,     // Cor primária do tema (azul por padrão)
            shadowColor: colors.text,            // Cor da sombra baseada na cor do texto
          }
        ]}
        
        // =============================================================
        // EVENTOS E INTERAÇÕES
        // =============================================================
        onPress={onPress} // Função executada quando o botão é pressionado
        
        // =============================================================
        // ACESSIBILIDADE
        // =============================================================
        accessibilityRole="button"               // Informa aos leitores de ecrã que é um botão
        accessibilityLabel="Abrir menu de definições" // Nome descritivo para leitores de ecrã
        accessibilityHint="Abre as definições do jogo incluindo tema, estatísticas e opções de reinício" 
        // Descrição da ação que será executada
        
      >
        {/**
         * Texto/Ícone dentro do botão
         * 
         * Características:
         * - Ícone de engrenagem (⚙️) - universalmente reconhecido para definições
         * - Cor dinâmica baseada no tema para garantir contraste
         */}
        <Text style={[styles.buttonText, { color: colors.card }]}>
          ⚙️
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// =============================================================
// ESTILOS DO COMPONENTE
// =============================================================
const styles = StyleSheet.create({
  /**
   * Container SafeAreaView - Posicionamento seguro do botão
   * 
   * Propriedades:
   * - position: 'absolute' → Permite que o botão flutue sobre outros componentes
   * - bottom → Distância do fundo da tela
   * - left → Distância da borda esquerda
   * - zIndex → Garante que o botão fique sempre por cima de outros elementos
   * 
   * Ajustes por plataforma:
   * - iOS: 100px do fundo (mais afastado para evitar barra de gestos)
   * - Android/Outros: 80px do fundo (posição mais acessível)
   */
  safeAreaContainer: {
    position: "absolute",           // Posicionamento absoluto na tela
    
    // ✅ POSIÇÃO INFERIOR ESQUERDA ATUALIZADA
    bottom: Platform.OS === 'ios' ? 100 : 80, // ✅ ALTERAÇÃO: Mais espaço do fundo
    left: 20,                       // 20 pontos da borda esquerda
    zIndex: 10,                     // ✅ ALTERAÇÃO: Garante que fica por cima de outros elementos
    
    /**
     * Porque Platform.OS?
     * - iOS tem uma barra de gestos na parte inferior que pode interferir
     * - Android tem comportamentos diferentes dependendo da versão/fabricante
     * - Web não precisa de ajustes especiais
     * 
     * Porque zIndex: 10?
     * - Garante que o botão está sempre visível sobre outros componentes
     * - Valor 10 é alto o suficiente para sobrepor a maioria dos elementos
     * - Evita que seja ocultado por modais ou outros componentes absolutos
     */
  },

  /**
   * Estilo principal do botão
   * 
   * Design:
   * - Formato circular (borderRadius = metade da largura/altura)
   * - Sombra suave para efeito de elevação
   * - Tamanho fixo para consistência
   */
  button: {
    // DIMENSÕES:
    width: 50,                      // Largura fixa
    height: 50,                     // Altura fixa (cria um quadrado)
    
    // FORMA:
    borderRadius: 25,               // Metade de 50 = círculo perfeito
    
    // LAYOUT INTERNO:
    alignItems: "center",           // Centraliza horizontalmente
    justifyContent: "center",       // Centraliza verticalmente
    
    // EFEITOS VISUAIS (SOMBRA):
    shadowOffset: {
      width: 0,                     // Sombra sem deslocamento horizontal
      height: 2,                    // Sombra com 2px de deslocamento vertical
    },
    shadowOpacity: 0.25,            // 25% de opacidade na sombra
    shadowRadius: 3.84,             // Desfoque de 3.84px na sombra
    
    // ELEVAÇÃO (ANDROID):
    elevation: 5,                   // Sombra no Android (equivalente à shadow no iOS)
    
    /**
     * Porque shadow + elevation?
     * - shadow* propriedades funcionam no iOS
     * - elevation funciona no Android
     * - Usamos ambos para garantir compatibilidade cross-platform
     */
  },

  /**
   * Estilo do texto/ícone dentro do botão
   * 
   * Características:
   * - Tamanho adequado para visibilidade
   * - Peso da fonte para destaque
   */
  buttonText: {
    fontSize: 20,                   // Tamanho do ícone (emoji)
    fontWeight: "600",              // Peso semi-negrito (destaque moderado)
    
    /**
     * Porque fontWeight: "600"?
     * - "600" é um bom equilíbrio entre destaque e elegância
     * - Não é muito fino ("400") nem muito pesado ("700" ou "800")
     * - Funciona bem com emojis na maioria dos dispositivos
     */
  },
});

// =============================================================
// NOTAS ADICIONAIS DE IMPLEMENTAÇÃO
// =============================================================

/**
 * VANTAGENS DESTA IMPLEMENTAÇÃO:
 * 
 * 1. ✅ POSIÇÃO SEGURA - Não interfere com conteúdo do jogo
 * 2. ✅ ACESSÍVEL - Leitores de ecrã conseguem identificar e descrever
 * 3. ✅ RESPONSIVA - Adapta-se a diferentes tamanhos de tela
 * 4. ✅ CROSS-PLATFORM - Funciona igualmente bem em iOS, Android e Web
 * 5. ✅ TEMA CONSISTENTE - Usa cores do sistema de temas
 * 6. ✅ FEEDBACK VISUAL - TouchableOpacity fornece feedback nativo
 * 7. ✅ ÁREAS SEGURAS - Respeita notch, barras de gestos, etc.
 * 8. ✅ PRIORIDADE VISUAL - zIndex garante que está sempre visível
 */

/**
 * COMPORTAMENTO EM DIFERENTES PLATAFORMAS:
 * 
 * iOS:
 * - Posicionado 100px do fundo (evita barra de gestos com maior margem)
 * - Sombra suave (propriedades shadow*)
 * 
 * Android:
 * - Posicionado 80px do fundo (posição mais acessível)
 * - Elevação nativa (propriedade elevation)
 * 
 * Web:
 * - Posicionado 80px do fundo
 * - Funciona com mouse e toque
 */

/**
 * ALTERAÇÕES REALIZADAS:
 * 
 * 1. ✅ bottom aumentado:
 *    - iOS: 34px → 100px
 *    - Android: 20px → 80px
 * 
 * 2. ✅ zIndex adicionado:
 *    - Valor: 10
 *    - Garante visibilidade sobre outros elementos
 * 
 * 3. ✅ Posição mais ergonómica:
 *    - Mais fácil de alcançar com o polegar
 *    - Não interfere com gestos do sistema
 *    - Melhor visibilidade durante o jogo
 */

/**
 * PERSONALIZAÇÕES POSSÍVEIS:
 * 
 * Para ajustar a posição:
 * - Modificar 'bottom' e 'left' em safeAreaContainer
 * 
 * Para ajustar o tamanho:
 * - Modificar 'width' e 'height' em button
 * - Ajustar 'borderRadius' para manter formato circular
 * 
 * Para ajustar a aparência:
 * - Modificar cores dinâmicas no style do TouchableOpacity
 * - Alterar ícone no Text interno
 * 
 * Para ajustar a camada:
 * - Modificar 'zIndex' para valores maiores ou menores
 */