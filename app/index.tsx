import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { useTheme } from "../src/theme/ThemeContext";

export default function MainMenu() {
  const router = useRouter();
  const { colors, mode, toggleTheme } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <Text style={[styles.title, { color: colors.text }]}>Sağlık Monitörü</Text>
      <MenuButton
        label="1. İlaç Yönetimi (Ekle/Düzenle)"
        onPress={() => router.push("/med-menu")}
      />
      <MenuButton
        label="2. Veri Girişi (Tansiyon / İlaç)"
        onPress={() => router.push("/tracking-menu")}
      />
      <MenuButton
        label="3. Kayıtları İzle (Loglar)"
        onPress={() => router.push("/log-menu")}
      />
      <MenuButton
        label={mode === "dark" ? "☀️ Aydınlık Temaya Geç" : "🌙 Karanlık Temaya Geç"}
        variant="muted"
        onPress={toggleTheme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
});
