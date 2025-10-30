// src/theme/Theme.tsx

// Importa React e ferramentas para criar/usar contexto e memorizar valores
import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
// Importa o tipo 'ColorValue' do react-native
import { ColorValue } from "react-native";
// Importa AsyncStorage para persistir a preferência do tema entre execuções
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a estrutura da paleta de cores usada em toda a UI
export type Palette = {
  primary: ColorValue | undefined;
  background: string;
  text: string;
  card: string;
  border: string;
  muted: string;
  success: string;   // Nova cor para sucesso
  error: string;     // Nova cor para erro
  warning: string;   // Nova cor para aviso
};

// Define o formato do valor guardado no contexto do tema
type ThemeContextValue = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: Palette;
};

// Cria o contexto com um valor padrão seguro (light mode)
const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
  colors: {
    primary: undefined,
    background: "#f6f7f9",
    text: "#101214",
    card: "#ffffff",
    border: "#e5e7eb",
    muted: "#6b7280",
    success: "#4CAF50",
    error: "#f44336",
    warning: "#FF9800",
  },
});

// Hook de conveniência para consumir o tema em qualquer componente
export function useTheme() {
  return useContext(ThemeContext);
}

// Chave de storage para persistir a preferência do utilizador
const THEME_KEY = "@theme_darkMode";

// Provider do tema que envolve a app inteira (usado no App.tsx)
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Estado que guarda se o modo escuro está ativo
  const [darkMode, setDarkMode] = useState(false);

  // Ao iniciar (useEffect com []), tenta ler do AsyncStorage a última preferência
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);
        if (raw != null) {
          setDarkMode(JSON.parse(raw));
        }
      } catch {
        // Em caso de erro, ignora e mantém o default (false)
      }
    })();
  }, []);

  // Sempre que o estado 'darkMode' mudar, persiste o novo valor no AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(darkMode));
  }, [darkMode]);

  // Função que alterna o estado darkMode
  const toggleDarkMode = () => setDarkMode((v) => !v);

  // Calcula a paleta de cores adequada ao modo atual (memorizado)
  const colors = useMemo<Palette>(() => {
    if (darkMode) {
      // Paleta escura
      return {
        primary: "#4f8cff",
        background: "#0f1115",
        text: "#f2f2f3",
        card: "#1a1d24",
        border: "#2a2e36",
        muted: "#9ca3af",
        success: "#4CAF50",
        error: "#f44336",
        warning: "#FF9800",
      };
    }
    // Paleta clara
    return {
      primary: "#4f8cff",
      background: "#f6f7f9",
      text: "#101214",
      card: "#ffffff",
      border: "#e5e7eb",
      muted: "#6b7280",
      success: "#4CAF50",
      error: "#f44336",
      warning: "#FF9800",
    };
  }, [darkMode]);

  // Valor a expor via contexto (memorizado)
  const value = useMemo(() => ({ darkMode, toggleDarkMode, colors }), [darkMode, colors]);

  // Entrega o contexto (value) aos componentes filhos (children)
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}