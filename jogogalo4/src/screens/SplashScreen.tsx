// Importa React e o hook useEffect para efeitos temporizados
import React, { useEffect } from "react";
// Importa componentes básicos do React Native
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

// Declara o tipo das props (propriedades recebidas do App)
type SplashProps = {
  onDone: () => void; // Função a executar quando o splash terminar
};

// Componente SplashScreen — mostra um pequeno ecrã de introdução
export default function SplashScreen({ onDone }: SplashProps) {
  // useEffect é usado para executar código assim que o componente for montado
  useEffect(() => {
    // Define um temporizador de 2 segundos
    const timer = setTimeout(() => {
      // Após esse tempo, chama o callback "onDone" recebido do App
      onDone();
    }, 2000);

    // Retorna uma função de limpeza para cancelar o timer se o componente for desmontado antes
    return () => clearTimeout(timer);
  }, []);

  // Renderização do conteúdo do Splash Screen
  return (
    <View style={styles.container}>
      {/* Título central */}
      <Text style={styles.title}>Jogo do Galo</Text>

      {/* Indicador de carregamento abaixo do título */}
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
}

// -----------------------------------------------------------------------------
// Estilos visuais da tela de Splash
// -----------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1, // ocupa todo o ecrã
    justifyContent: "center", // centra verticalmente
    alignItems: "center", // centra horizontalmente
    backgroundColor: "#fff", // fundo branco (neutro)
  },
  title: {
    fontSize: 32, // tamanho grande para destaque
    fontWeight: "bold", // texto em negrito
    marginBottom: 20, // espaço entre o texto e o indicador
  },
});
