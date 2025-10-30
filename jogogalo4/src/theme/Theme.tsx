// src/theme/Theme.tsx

// Importa React e ferramentas para criar/usar contexto e memorizar valores
import React, { createContext, useContext, useMemo, useState, ReactNode, useEffect } from "react";
// Importa AsyncStorage para persistir a preferência do tema entre execuções
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define a estrutura da paleta de cores usada em toda a UI
export type Palette = {
  primary: ColorValue | undefined; // (Não usado no teu código atual, mas definido)
  background: string; // cor de fundo principal da aplicação
  text: string; // cor de texto principal
  card: string; // cor de cartões/painéis/inputs
  border: string; // cor de bordas e divisores
  muted: string; // cor de texto secundário e placeholders
};

// Define o formato do valor guardado no contexto do tema
type ThemeContextValue = {
  darkMode: boolean; // indica se o modo escuro está ativo
  toggleDarkMode: () => void; // alterna entre claro e escuro
  colors: Palette; // paleta de cores correspondente ao modo atual
};

// Cria o contexto com um valor padrão seguro (light mode)
const ThemeContext = createContext<ThemeContextValue>({
  darkMode: false, // padrão é light mode
  toggleDarkMode: () => {}, // função vazia por defeito
  colors: { // paleta light mode por defeito
    background: "#f6f7f9",
    text: "#101214",
    card: "#ffffff",
    border: "#e5e7eb",
    muted: "#6b7280",
  },
});

// Hook de conveniência para consumir o tema em qualquer componente
export function useTheme() {
  // Retorna o valor atual do contexto (darkMode, toggleDarkMode, colors)
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
        // Tenta ler a string guardada no dispositivo
        const raw = await AsyncStorage.getItem(THEME_KEY);
        // Se existir (não for null)
        if (raw != null) {
          // Converte de string ("true" ou "false") para boolean e atualiza o estado
          setDarkMode(JSON.parse(raw));
        }
      } catch {
        // Em caso de erro (ex: storage corrompido), ignora e mantém o default (false)
      }
    })();
  }, []); // [] = Executa apenas uma vez, quando o componente é montado

  // Sempre que o estado 'darkMode' mudar, persiste o novo valor no AsyncStorage
  useEffect(() => {
    // Converte o boolean (true/false) para string ("true"/"false") e guarda
    AsyncStorage.setItem(THEME_KEY, JSON.stringify(darkMode));
  }, [darkMode]); // [darkMode] = Executa sempre que 'darkMode' mudar

  // Função que alterna o estado darkMode
  const toggleDarkMode = () => setDarkMode((v) => !v); // inverte o valor atual

  // Calcula a paleta de cores adequada ao modo atual
  // useMemo garante que este objeto 'colors' só é recalculado se 'darkMode' mudar
  const colors = useMemo<Palette>(() => {
    // Se o modo escuro estiver ativo, retorna a paleta escura
    if (darkMode) {
      return {
        background: "#0f1115", // fundo escuro
        text: "#f2f2f3",       // texto claro
        card: "#1a1d24",       // cartões escuros
        border: "#2a2e36",     // bordas claras
        muted: "#9ca3af",      // texto secundário
      };
    }
    // Senão, retorna a paleta clara (padrão)
    return {
      background: "#f6f7f9", // fundo claro
      text: "#101214",       // texto escuro
      card: "#ffffff",       // cartões brancos
      border: "#e5e7eb",     // bordas cinzentas
      muted: "#6b7280",      // texto secundário
    };
  }, [darkMode]); // [darkMode] = Dependência do useMemo

  // Valor a expor via contexto (também memorizado)
  const value = useMemo(() => ({ darkMode, toggleDarkMode, colors }), [darkMode, colors]);

  // Entrega o contexto (value) aos componentes filhos (children)
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}