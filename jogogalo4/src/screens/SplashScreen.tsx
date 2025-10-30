// src/screens/SplashScreen.tsx

// Importa React e o hook useEffect para efeitos temporizados
import React, { useEffect } from "react";
// Importa componentes básicos do React Native
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

// Declara o tipo das props (propriedades recebidas do App.tsx)
type SplashProps = {
  onDone: () => void; // Função a executar quando o splash terminar
};

// Componente SplashScreen — mostra um pequeno ecrã de introdução
export default function SplashScreen({ onDone }: SplashProps) {
  // useEffect é usado para executar código assim que o componente for montado
  useEffect(() => {
    // Define um temporizador de 2 segundos (2000 milissegundos)
    const timer = setTimeout(() => {
      // Após esse tempo, chama o callback "onDone" recebido do App.tsx
      onDone();
    }, 2000);

    // Retorna uma função de limpeza:
    // Se o componente for desmontado (ex: fechar a app) antes dos 2s,
    // o temporizador é cancelado para evitar erros.
    return () => clearTimeout(timer);
  }, []); // [] = Executa apenas uma vez

  // Renderização do conteúdo do Splash Screen
  return (
    <View style={styles.container}>
      {/* Título central */}
      <Text style={styles.title}>Jogo do Galo</Text>

      {/* Indicador de carregamento (Spinner) abaixo do título */}
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
    backgroundColor: "#fff", // fundo branco (neutro, não depende do tema ainda)
  },
  title: {
    fontSize: 32, // tamanho grande para destaque
    fontWeight: "bold", // texto em negrito
    marginBottom: 20, // espaço entre o texto e o indicador
  },
});