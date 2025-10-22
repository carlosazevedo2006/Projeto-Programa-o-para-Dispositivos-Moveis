// src/screens/StatsScreen.tsx

// Importa React e hooks
import React, { useEffect, useState } from "react";
// Importa componentes básicos
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// Importa AsyncStorage para persistir estatísticas
import AsyncStorage from "@react-native-async-storage/async-storage";
// Importa tema global
import { useTheme } from "../theme/Theme";

// Tipo das estatísticas
export type Stats = { wins: number; draws: number; losses: number };

// Chave no storage
export const STATS_KEY = "@stats";

// Teto razoável para evitar valores absurdos caso o storage tenha lixo
const MAX_REASONABLE = 100000;

// Converte qualquer valor para inteiro seguro dentro do intervalo [0, MAX_REASONABLE]
function clampInt(x: any): number {
  const n = Number(x);                           // tenta converter para número
  if (!Number.isFinite(n) || n < 0) return 0;    // se inválido, usa 0
  return Math.min(Math.floor(n), MAX_REASONABLE);// trunca e aplica teto
}

// Normaliza um objeto vindo do storage para o formato Stats válido
export function normalizeStats(raw: any): Stats {
  return {
    wins: clampInt(raw?.wins),
    draws: clampInt(raw?.draws),
    losses: clampInt(raw?.losses),
  };
}

// Lê estatísticas do storage e normaliza
export async function loadStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);        // lê string JSON
    if (!raw) return { wins: 0, draws: 0, losses: 0 };        // se não existir, zera
    const parsed = JSON.parse(raw);                           // parse JSON
    return normalizeStats(parsed);                            // normaliza campos
  } catch {
    // Em caso de erro de leitura/parse, retorna zeros
    return { wins: 0, draws: 0, losses: 0 };
  }
}

// Salva estatísticas normalizadas no storage
export async function saveStats(s: Stats) {
  const clean = normalizeStats(s);                            // garante formato
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(clean)); // persiste
}

// Props esperadas pela tela
type Props = { onBack: () => void };

// Componente da tela de estatísticas
export default function StatsScreen({ onBack }: Props) {
  // Estado local com as estatísticas visíveis
  const [stats, setStats] = useState<Stats>({ wins: 0, draws: 0, losses: 0 });
  // Paleta do tema atual
  const { colors } = useTheme();

  // Ao montar, carrega estatísticas e aplica no estado
  useEffect(() => {
    (async () => {
      const s = await loadStats();   // lê e normaliza
      setStats(s);                   // mostra na UI
    })();
  }, []);

  // Handler para limpar estatísticas
  const handleClear = async () => {
    const empty = { wins: 0, draws: 0, losses: 0 }; // objeto zerado
    await saveStats(empty);                         // persiste zerado
    setStats(empty);                                // atualiza UI
  };

  // Render da tela
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título da seção */}
      <Text style={[styles.title, { color: colors.text }]}>Estatísticas</Text>

      {/* Cartão com linhas de dados */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Vitórias</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats.wins}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Empates</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats.draws}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.text }]}>Derrotas</Text>
          <Text style={[styles.value, { color: colors.text }]}>{stats.losses}</Text>
        </View>
      </View>

      {/* Ações básicas: voltar e limpar */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={onBack}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Voltar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleClear}
        >
          <Text style={[styles.buttonText, { color: "#c33" }]}>Limpar estatísticas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Estilos da tela de estatísticas
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },                               // container principal
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },       // título
  card: { borderWidth: 1, borderRadius: 12, padding: 12 },            // cartão
  row: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingVertical: 12,
  },
  label: { fontSize: 16 },                                            // rótulo
  value: { fontSize: 16, fontWeight: "600" },                         // valor
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },          // linha de botões
  button: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }, // botão
  buttonText: { fontSize: 14, fontWeight: "700" },                    // texto do botão
});
