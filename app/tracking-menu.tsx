import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { useTheme } from "../src/theme/ThemeContext";

export default function TrackingMenu() {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <MenuButton
        label="Tansiyon Değeri Gir"
        onPress={() => router.push("/bp-tracking")}
      />
      <MenuButton
        label="İlaç Kullanımı Gir"
        onPress={() => router.push("/med-tracking")}
      />
      <MenuButton
        label="Ana Menüye Dön"
        variant="muted"
        onPress={() => router.push("/")}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
});
