import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { GroupBox } from "../src/components/GroupBox";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";
import { Language } from "../src/i18n/translations";
import {
  getCloudUrl,
  getApiToken,
  saveCloudSettings,
} from "../src/db/cloudSettings";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, mode, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  const [cloudUrl, setCloudUrl] = useState("");
  const [existingToken, setExistingToken] = useState("");
  const [tokenMasked, setTokenMasked] = useState(false);
  const [tokenInput, setTokenInput] = useState("");

  useEffect(() => {
    setCloudUrl(getCloudUrl());
    const tok = getApiToken();
    setExistingToken(tok);
    setTokenMasked(!!tok);
  }, []);

  function handleChangeToken() {
    setTokenMasked(false);
    setTokenInput("");
  }

  function handleSave() {
    const finalToken = tokenMasked
      ? existingToken
      : tokenInput || existingToken;
    saveCloudSettings(cloudUrl.trim(), finalToken);
    setExistingToken(finalToken);
    setTokenMasked(!!finalToken);
    setTokenInput("");
    Alert.alert(t("common.success"), t("settings.saved"));
    router.back();
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <GroupBox title={t("settings.languageSection")}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("settings.language")}
          </Text>
          <View style={styles.languageRow}>
            <LanguageOption
              label={t("settings.languageTurkish")}
              selected={language === "tr"}
              onPress={() => setLanguage("tr" as Language)}
              colors={colors}
            />
            <LanguageOption
              label={t("settings.languageEnglish")}
              selected={language === "en"}
              onPress={() => setLanguage("en" as Language)}
              colors={colors}
            />
          </View>
        </GroupBox>

        <GroupBox title={language === "tr" ? "Görünüm" : "Appearance"}>
          <Text style={[styles.label, { color: colors.text }]}>
            {language === "tr" ? "Uygulama Teması" : "App Theme"}
          </Text>
          <View style={styles.languageRow}>
            <LanguageOption
              label={language === "tr" ? "☀️ Aydınlık" : "☀️ Light"}
              selected={mode === "light"}
              onPress={() => {
                if (mode !== "light") toggleTheme();
              }}
              colors={colors}
            />
            <LanguageOption
              label={language === "tr" ? "🌙 Karanlık" : "🌙 Dark"}
              selected={mode === "dark"}
              onPress={() => {
                if (mode !== "dark") toggleTheme();
              }}
              colors={colors}
            />
          </View>
        </GroupBox>

        <GroupBox title={t("settings.cloudSection")}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("settings.cloudUrl")}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.inputBackground,
                borderColor: colors.border,
              },
            ]}
            placeholder={t("settings.cloudUrlPlaceholder")}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            value={cloudUrl}
            onChangeText={setCloudUrl}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            {t("settings.apiToken")}
          </Text>
          {tokenMasked ? (
            <View style={styles.tokenRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.tokenInputMasked,
                  {
                    color: colors.textMuted,
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.border,
                  },
                ]}
                value="***"
                editable={false}
              />
              <Pressable
                style={[
                  styles.changeButton,
                  { backgroundColor: colors.buttonMuted },
                ]}
                onPress={handleChangeToken}
              >
                <Text style={styles.changeButtonText}>
                  {t("settings.apiTokenChange")}
                </Text>
              </Pressable>
            </View>
          ) : (
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t("settings.apiTokenPlaceholder")}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              value={tokenInput}
              onChangeText={setTokenInput}
            />
          )}
        </GroupBox>

        <GroupBox
          title={
            language === "tr" ? "Wear OS (Akıllı Saat)" : "Wear OS (Smartwatch)"
          }
        >
          {Platform.OS === "android" ? (
            <>
              <Text
                style={{
                  color: colors.text,
                  marginBottom: 8,
                  fontWeight: "bold",
                }}
              >
                {language === "tr"
                  ? "Durum: Aktif / Bağlantı Hazır ✅"
                  : "Status: Active / Ready ✅"}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  marginBottom: 4,
                }}
              >
                {language === "tr"
                  ? "• Saatten girilen Tansiyon kayıtları anında uygulamaya senkronize edilir."
                  : "• Blood pressure logs from the watch sync instantly."}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {language === "tr"
                  ? "• Saatten girilen İlaç İçildi kayıtları anında uygulamaya senkronize edilir."
                  : "• Medication logs from the watch sync instantly."}
              </Text>
            </>
          ) : (
            <Text style={{ color: colors.textMuted }}>
              {language === "tr"
                ? "Wear OS bağlantısı yalnızca Android cihazlarda desteklenmektedir."
                : "Wear OS connection is only supported on Android devices."}
            </Text>
          )}
        </GroupBox>

        <MenuButton
          label={t("settings.save")}
          variant="primary"
          onPress={handleSave}
        />
        <MenuButton
          label={t("common.back")}
          variant="muted"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function LanguageOption({
  label,
  selected,
  onPress,
  colors,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.languageOption,
        {
          backgroundColor: selected ? colors.primary : colors.inputBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={{
          color: selected ? "#fff" : colors.text,
          fontWeight: selected ? "700" : "400",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16 },
  label: { fontWeight: "600", marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  languageRow: { flexDirection: "row", gap: 10 },
  languageOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  tokenRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  tokenInputMasked: { flex: 1, marginBottom: 0 },
  changeButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  changeButtonText: { color: "#fff", fontWeight: "600" },
});
