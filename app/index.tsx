import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";

export default function MainMenu() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sağlık Monitörü</Text>
      <MenuButton label="1. İlaç Yönetimi (Ekle/Düzenle)" onPress={() => router.push("/med-menu")} />
      <MenuButton label="2. Veri Girişi (Tansiyon / İlaç)" onPress={() => router.push("/tracking-menu")} />
      <MenuButton label="3. Kayıtları İzle (Loglar)" onPress={() => router.push("/log-menu")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 32, textAlign: "center" },
});
