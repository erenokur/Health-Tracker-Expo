import React, { useState } from "react";
import { Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { requestWidgetUpdate } from "react-native-android-widget";
import { MenuButton } from "../src/components/MenuButton";
import { addBpLog, getLatestBpLog } from "../src/db/bpLogs";
import { LatestBpWidget } from "../src/widgets/LatestBpWidget";

async function refreshBpWidget() {
  const latest = getLatestBpLog();
  await requestWidgetUpdate({
    widgetName: "LatestBp",
    renderWidget: () => (
      <LatestBpWidget
        sys={latest?.sys}
        dia={latest?.dia}
        pulse={latest?.pulse ?? null}
        timestamp={latest?.timestamp}
      />
    ),
    widgetNotFound: () => {
      // No widget on the home screen yet — nothing to update.
    },
  });
}

export default function BpTrackingScreen() {
  const router = useRouter();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [pulse, setPulse] = useState("");
  const [note, setNote] = useState("");

  function handleSave() {
    if (!sys || !dia) {
      Alert.alert("Hata", "Büyük ve küçük tansiyon girilmelidir.");
      return;
    }
    addBpLog({
      sys: parseInt(sys, 10),
      dia: parseInt(dia, 10),
      pulse: pulse ? parseInt(pulse, 10) : null,
      note,
    });
    refreshBpWidget();
    Alert.alert("Başarılı", "Tansiyon kaydı eklendi.");
    setSys("");
    setDia("");
    setPulse("");
    setNote("");
    router.push("/tracking-menu");
  }

  return (
    <SafeAreaView style={styles.flex} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tansiyon Ekle</Text>
        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Büyük Tansiyon (Örn: 120)"
          keyboardType="number-pad"
          value={sys}
          onChangeText={setSys}
        />
        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Küçük Tansiyon (Örn: 80)"
          keyboardType="number-pad"
          value={dia}
          onChangeText={setDia}
        />
        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Nabız"
          keyboardType="number-pad"
          value={pulse}
          onChangeText={setPulse}
        />
        <TextInput
          placeholderTextColor="#64748b"
          style={styles.input}
          placeholder="Açıklama / Notunuz"
          value={note}
          onChangeText={setNote}
        />
        <MenuButton label="KAYDET" variant="primary" onPress={handleSave} />
        <MenuButton
          label="Geri Dön"
          variant="muted"
          onPress={() => router.push("/tracking-menu")}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#f8fafc" },
  container: { padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 18,
    color: "#000",
    backgroundColor: "#fff",
  },
});
