import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { db } from "./database";

export async function exportData() {
  try {
    const categories = db.getAllSync("SELECT * FROM categories");
    const medications = db.getAllSync("SELECT * FROM medications");
    const bp_logs = db.getAllSync("SELECT * FROM bp_logs");
    const med_logs = db.getAllSync("SELECT * FROM med_logs");

    const exportObject = {
      version: 1,
      categories,
      medications,
      bp_logs,
      med_logs,
    };

    const jsonString = JSON.stringify(exportObject, null, 2);

    // Format timestamp as YYYY-MM-DD_HH-mm-ss
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

    // Create a temporary file path
    const fileUri = `${FileSystem.documentDirectory}health-tracker-backup_${timestamp}.json`;

    // Write JSON to file
    await FileSystem.writeAsStringAsync(fileUri, jsonString, {
      encoding: "utf8",
    });

    // Share / Save the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/json",
        dialogTitle: "Yedek Dosyasını Kaydet",
        UTI: "public.json", // For iOS
      });
    } else {
      Alert.alert("Hata", "Dosya paylaşımı bu cihazda desteklenmiyor.");
    }
  } catch (error: any) {
    Alert.alert("Dışa Aktarma Hatası", error.message);
  }
}

export async function importData() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return; // User canceled
    }

    const fileUri = result.assets[0].uri;
    const jsonString = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "utf8",
    });

    const importObject = JSON.parse(jsonString);

    if (!importObject || typeof importObject !== "object") {
      throw new Error("Geçersiz dosya formatı.");
    }

    db.withTransactionSync(() => {
      // Import categories
      if (Array.isArray(importObject.categories)) {
        for (const cat of importObject.categories) {
          db.runSync(
            `INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)`,
            [cat.id, cat.name],
          );
        }
      }

      // Import medications
      if (Array.isArray(importObject.medications)) {
        for (const med of importObject.medications) {
          db.runSync(
            `INSERT OR IGNORE INTO medications 
            (id, name, category, description, is_active, notes, daily_dose, meal_type, updated_at, deleted, synced) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              med.id,
              med.name,
              med.category,
              med.description,
              med.is_active,
              med.notes,
              med.daily_dose,
              med.meal_type,
              med.updated_at,
              med.deleted,
              med.synced,
            ],
          );
        }
      }

      // Import bp_logs
      if (Array.isArray(importObject.bp_logs)) {
        for (const log of importObject.bp_logs) {
          db.runSync(
            `INSERT OR IGNORE INTO bp_logs 
            (id, timestamp, sys, dia, pulse, note, updated_at, deleted, synced) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              log.id,
              log.timestamp,
              log.sys,
              log.dia,
              log.pulse,
              log.note,
              log.updated_at,
              log.deleted,
              log.synced,
            ],
          );
        }
      }

      // Import med_logs
      if (Array.isArray(importObject.med_logs)) {
        for (const log of importObject.med_logs) {
          db.runSync(
            `INSERT OR IGNORE INTO med_logs 
            (id, timestamp, med_name, meal_type, updated_at, deleted, synced) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              log.id,
              log.timestamp,
              log.med_name,
              log.meal_type,
              log.updated_at,
              log.deleted,
              log.synced,
            ],
          );
        }
      }
    });

    Alert.alert(
      "Başarılı",
      "Eski kayıtlarınız korunarak yeni veriler içeri aktarıldı.",
    );
  } catch (error: any) {
    Alert.alert("İçe Aktarma Hatası", error.message);
  }
}
