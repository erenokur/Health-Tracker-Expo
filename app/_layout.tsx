import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDb } from "../src/db/database";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";
import { LanguageProvider, useLanguage } from "../src/i18n/LanguageContext";
import { useWearBridgeListener } from "../src/wear/useWearBridgeListener";

import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function ThemedDrawer() {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.headerText,
        sceneStyle: { backgroundColor: colors.background },
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Ana Sayfaya Geçiş",
          drawerLabel: "Ana Sayfaya Geçiş",
          headerTitle: t("mainMenu.title"),
        }}
      />
      <Drawer.Screen name="med-menu" options={{ title: t("medMenu.title") }} />
      <Drawer.Screen name="log-menu" options={{ title: t("logMenu.title") }} />
      <Drawer.Screen
        name="notifications"
        options={{ title: t("appMenu.notifications") }}
      />
      <Drawer.Screen
        name="settings"
        options={{ title: t("appMenu.settings") }}
      />

      {/* Hidden items */}
      <Drawer.Screen
        name="medication"
        options={{
          title: t("medication.titleAdd"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="med-list"
        options={{
          title: t("medMenu.editList"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="tracking-menu"
        options={{
          title: t("trackingMenu.title"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="bp-tracking"
        options={{
          title: t("bpTracking.title"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="med-tracking"
        options={{
          title: t("medTracking.title"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="bp-logs"
        options={{
          title: t("logMenu.bp"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="med-logs"
        options={{
          title: t("logMenu.med"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="bp-log-edit"
        options={{
          title: t("bpLogEdit.title"),
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="med-log-edit"
        options={{
          title: t("medLogEdit.title"),
          drawerItemStyle: { display: "none" },
        }}
      />

      <Drawer.Screen
        name="about"
        options={{
          title: t("appMenu.about"),
        }}
      />
    </Drawer>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  useWearBridgeListener();

  useEffect(() => {
    initDb();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>
          Veritabanı hazırlanıyor... / Preparing database...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ThemedDrawer />
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
