import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDb } from "../src/db/database";

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDb();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 12 }}>Veritabanı hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#1E293B" },
          headerTintColor: "#fff",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Sağlık Monitörü" }} />
        <Stack.Screen name="med-menu" options={{ title: "İlaç Yönetimi" }} />
        <Stack.Screen name="medication" options={{ title: "İlaç" }} />
        <Stack.Screen name="med-list" options={{ title: "Kayıtlı İlaçlar" }} />
        <Stack.Screen name="tracking-menu" options={{ title: "Veri Girişi" }} />
        <Stack.Screen name="bp-tracking" options={{ title: "Tansiyon Ekle" }} />
        <Stack.Screen name="med-tracking" options={{ title: "İlaç İçildi" }} />
        <Stack.Screen name="log-menu" options={{ title: "Kayıtlar" }} />
        <Stack.Screen name="bp-logs" options={{ title: "Tansiyon Kayıtları" }} />
        <Stack.Screen name="med-logs" options={{ title: "İlaç Kayıtları" }} />
      </Stack>
    </SafeAreaProvider>
  );
}
