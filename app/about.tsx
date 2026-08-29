import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLanguage();

  const appName = Constants.expoConfig?.name ?? "Sağlık Monitörü";
  const version = Constants.expoConfig?.version ?? "—";
  const androidPackage = Constants.expoConfig?.android?.package ?? "—";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <View style={styles.center}>
        <Text style={[styles.appName, { color: colors.text }]}>{appName}</Text>
        <Text style={[styles.version, { color: colors.textMuted }]}>
          {t("about.version")} {version}
        </Text>

        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <InfoRow label={t("about.packageName")} value={androidPackage} colors={colors} />
          <InfoRow label={t("about.platform")} value="Android" colors={colors} />
        </View>

        <Text style={[styles.note, { color: colors.textMuted }]}>{t("about.note")}</Text>
      </View>

      <MenuButton label={t("common.back")} variant="muted" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={[infoRowStyles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[infoRowStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: "600" },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "space-between" },
  center: { alignItems: "center", marginTop: 40 },
  appName: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  version: { fontSize: 15, marginBottom: 24 },
  infoBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  note: { fontSize: 13, textAlign: "center", paddingHorizontal: 12 },
});
