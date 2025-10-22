// src/theme/Theme.tsx

// Importa React e ferramentas para criar/usar contexto e memorizar valores
import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
// Importa AsyncStorage para persistir a preferência do tema entre execuções
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a estrutura da paleta de cores usada em toda a UI
export type Palette = {
  primary: ColorValue | undefined;
  background: string; // cor de fundo principal da aplicação
  text: string;       // cor de texto principal
  card: string;       // cor de cartões/painéis/inputs
  border: string;     // cor de bordas e divisores
  muted: string;      // cor de texto secundário e placeholders
};

// Define o formato do valor guardado no contexto do tema
type ThemeContextValue = {
  darkMode: boolean;                // indica se o modo escuro está ativo
  toggleDarkMode: () => void;       // alterna entre claro e escuro
  colors: Palette;                  // paleta de cores correspondente ao modo atual
};

// Cria o contexto com um valor padrão seguro
const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
  colors: {
    background: "#f6f7f9",
    text: "#101214",
    card: "#ffffff",
    border: "#e5e7eb",
    muted: "#6b7280",
  },
});

// Hook de conveniência para consumir o tema em qualquer componente
export function useTheme() {
  return useContext(ThemeContext);
}

// Chave de storage para persistir a preferência do utilizador
const THEME_KEY = "@theme_darkMode";

// Provider do tema que envolve a app inteira
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Estado que guarda se o modo escuro está ativo
  const [darkMode, setDarkMode] = useState(false);

  // Ao iniciar, tenta ler do AsyncStorage a última preferência do utilizador
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(THEME_KEY);   // lê string ou null
        if (raw != null) setDarkMode(JSON.parse(raw));       // aplica se existir
      } catch {
        // Em caso de erro, mantém o default (claro)
      }
    })();
  }, []);

  // Sempre que darkMode mudar, persiste no AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(darkMode));
  }, [darkMode]);

  // Função que alterna o estado darkMode
  const toggleDarkMode = () => setDarkMode((v) => !v);

  // Calcula a paleta de cores adequada ao modo atual
  const colors = useMemo<Palette>(() => {
    if (darkMode) {
      return {
        background: "#0f1115",
        text: "#f2f2f3",
        card: "#1a1d24",
        border: "#2a2e36",
        muted: "#9ca3af",
      };
    }
    return {
      background: "#f6f7f9",
      text: "#101214",
      card: "#ffffff",
      border: "#e5e7eb",
      muted: "#6b7280",
    };
  }, [darkMode]);

  // Valor a expor via contexto
  const value = useMemo(() => ({ darkMode, toggleDarkMode, colors }), [darkMode, colors]);

  // Entrega o contexto aos filhos
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
