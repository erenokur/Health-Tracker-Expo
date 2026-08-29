import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

import { exportData, importData } from "../src/db/backup";

export default function LogMenu() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <MenuButton label={t("logMenu.bp")} onPress={() => router.push("/bp-logs")} />
      <MenuButton label={t("logMenu.med")} onPress={() => router.push("/med-logs")} />
      <MenuButton label={t("logMenu.export")} onPress={exportData} />
      <MenuButton label={t("logMenu.import")} onPress={importData} />
      <MenuButton label={t("common.backToMain")} variant="muted" onPress={() => router.push("/")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
});
