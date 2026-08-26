import React, { useState } from "react";
import { Text, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { addBpLog } from "../src/db/bpLogs";

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
        style={styles.input}
        placeholder="Büyük Tansiyon (Örn: 120)"
        keyboardType="number-pad"
        value={sys}
        onChangeText={setSys}
      />
      <TextInput
        style={styles.input}
        placeholder="Küçük Tansiyon (Örn: 80)"
        keyboardType="number-pad"
        value={dia}
        onChangeText={setDia}
      />
      <TextInput
        style={styles.input}
        placeholder="Nabız"
        keyboardType="number-pad"
        value={pulse}
        onChangeText={setPulse}
      />
      <TextInput style={styles.input} placeholder="Açıklama / Notunuz" value={note} onChangeText={setNote} />
        <MenuButton label="KAYDET" variant="primary" onPress={handleSave} />
        <MenuButton label="Geri Dön" variant="muted" onPress={() => router.push("/tracking-menu")} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 18,
  },
});
