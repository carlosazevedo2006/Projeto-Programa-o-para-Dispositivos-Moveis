// src/theme/Theme.tsx

// Importa React e ferramentas para criar/usar contexto e memorizar valores
import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
// Importa o tipo 'ColorValue' do react-native para tipagem correta de cores
import { ColorValue } from "react-native";
// Importa AsyncStorage para persistir a preferência do tema entre execuções
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a estrutura da paleta de cores usada em toda a UI
export type Palette = {
  primary: ColorValue;        // Cor primária para botões e elementos destacados
  secondary: ColorValue;      // Cor secundária para variações
  background: string;         // Cor de fundo principal
  text: string;              // Cor do texto principal
  textSecondary: string;     // Cor do texto secundário
  card: string;              // Cor de fundo de cartões e containers
  border: string;            // Cor das bordas e divisores
  muted: string;             // Cor para texto muted/placeholder
  success: string;           // Cor para estados de sucesso
  error: string;             // Cor para estados de erro
  warning: string;           // Cor para estados de aviso
  info: string;             // Cor para informações
};

// Define o formato do valor guardado no contexto do tema
type ThemeContextValue = {
  darkMode: boolean;         // Estado atual do modo escuro
  toggleDarkMode: () => void; // Função para alternar entre modo claro/escuro
  colors: Palette;           // Paleta de cores atual baseada no modo
};

// Cria o contexto com um valor padrão seguro (light mode)
const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
  colors: {
    primary: "#4f8cff",
    secondary: "#6c757d",
    background: "#f8f9fa",
    text: "#212529",
    textSecondary: "#6c757d",
    card: "#ffffff",
    border: "#dee2e6",
    muted: "#adb5bd",
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  },
});

// Hook de conveniência para consumir o tema em qualquer componente
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
}

// Chave de storage para persistir a preferência do utilizador
const THEME_KEY = "@tic_tac_toe_theme_darkMode";

// Provider do tema que envolve a app inteira (usado no App.tsx)
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Estado que guarda se o modo escuro está ativo
  const [darkMode, setDarkMode] = useState(false);
  // Estado para controlar se o tema já foi carregado do storage
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Ao iniciar (useEffect com []), tenta ler do AsyncStorage a última preferência
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (raw !== null) {
          const savedDarkMode = JSON.parse(raw);
          setDarkMode(savedDarkMode);
        }
      } catch (error) {
        console.error("Erro ao carregar tema:", error);
        // Em caso de erro, mantém o default (false) mas marca como carregado
      } finally {
        setIsThemeLoaded(true);
      }
    })();
  }, []);

  // Sempre que o estado 'darkMode' mudar, persiste o novo valor no AsyncStorage
  useEffect(() => {
    if (isThemeLoaded) {
      AsyncStorage.setItem(THEME_KEY, JSON.stringify(darkMode))
        .catch(error => console.error("Erro ao guardar tema:", error));
    }
  }, [darkMode, isThemeLoaded]);

  // Função que alterna o estado darkMode de forma segura
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Calcula a paleta de cores adequada ao modo atual (memorizado para performance)
  const colors = useMemo<Palette>(() => {
    if (darkMode) {
      // Paleta escura - cores otimizadas para contraste e conforto visual
      return {
        primary: "#4f8cff",           // Azul primário (mantido para consistência)
        secondary: "#6c757d",         // Cinza secundário
        background: "#0f1115",        // Fundo escuro quase preto
        text: "#f8f9fa",              // Texto branco suave
        textSecondary: "#adb5bd",     // Texto secundário cinza claro
        card: "#1a1d24",              // Cartão escuro
        border: "#2a2e36",            // Borda escura
        muted: "#6c757d",             // Texto muted
        success: "#4CAF50",           // Verde sucesso
        error: "#f44336",             // Vermelho erro
        warning: "#FF9800",           // Laranja aviso
        info: "#2196F3",              // Azul informação
      };
    }
    
    // Paleta clara - cores vivas mas suaves
    return {
      primary: "#4f8cff",             // Azul primário vibrante
      secondary: "#6c757d",           // Cinza secundário
      background: "#f8f9fa",          // Fundo branco suave
      text: "#212529",                // Texto preto suave
      textSecondary: "#6c757d",       // Texto secundário cinza
      card: "#ffffff",                // Cartão branco puro
      border: "#dee2e6",              // Borda cinza claro
      muted: "#adb5bd",               // Texto muted
      success: "#28a745",             // Verde sucesso
      error: "#dc3545",               // Vermelho erro
      warning: "#ffc107",             // Amarelo aviso
      info: "#17a2b8",                // Azul informação
    };
  }, [darkMode]);

  // Valor a expor via contexto (memorizado para evitar re-renderizações desnecessárias)
  const value = useMemo(() => ({
    darkMode,
    toggleDarkMode,
    colors
  }), [darkMode, colors]);

  // Não renderiza children até o tema ser carregado (evita flash)
  if (!isThemeLoaded) {
    return null; // Ou um loading screen se preferires
  }

  // Entrega o contexto (value) aos componentes filhos (children)
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}