import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRouter } from "expo-router";
import { MenuButton } from "../src/components/MenuButton";
import { CollapsibleSection } from "../src/components/CollapsibleSection";
import { DateTimePickerButton } from "../src/components/DateTimePickerButton";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";
import { getWeekdays, weekdayLabel } from "../src/notifications/weekdays";
import {
  ensureNotificationSetup,
  scheduleWeeklyReminder,
  cancelReminder,
} from "../src/notifications/scheduler";
import {
  listReminders,
  addReminder,
  deleteReminderRow,
  Reminder,
} from "../src/db/reminders";
import { listActiveMedicationNames } from "../src/db/medications";

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const weekdays = getWeekdays(language);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [medNames, setMedNames] = useState<string[]>([]);

  const [bpWeekday, setBpWeekday] = useState(weekdays[2].value); // default Tuesday
  const [bpTime, setBpTime] = useState(new Date());

  const [medWeekday, setMedWeekday] = useState(weekdays[2].value);
  const [medTime, setMedTime] = useState(new Date());
  const [selectedMed, setSelectedMed] = useState("");

  useFocusEffect(
    useCallback(() => {
      setReminders(listReminders());
      const active = listActiveMedicationNames();
      setMedNames(active);
      if (active.length > 0 && !selectedMed) setSelectedMed(active[0]);
    }, []),
  );

  async function handleAddBpReminder() {
    const granted = await ensureNotificationSetup();
    if (!granted) {
      Alert.alert(
        t("notifications.permissionNeededTitle"),
        t("notifications.permissionNeededBody"),
      );
      return;
    }
    const hour = bpTime.getHours();
    const minute = bpTime.getMinutes();
    const notificationId = await scheduleWeeklyReminder({
      title: t("notifications.bpTitle"),
      body: t("notifications.bpBody"),
      weekday: bpWeekday,
      hour,
      minute,
    });
    addReminder({
      type: "bp",
      weekday: bpWeekday,
      hour,
      minute,
      notificationId,
    });
    setReminders(listReminders());
  }

  async function handleAddMedReminder() {
    if (!selectedMed) {
      Alert.alert(t("common.error"), t("medTracking.errNoMed"));
      return;
    }
    const granted = await ensureNotificationSetup();
    if (!granted) {
      Alert.alert(
        t("notifications.permissionNeededTitle"),
        t("notifications.permissionNeededBody"),
      );
      return;
    }
    const hour = medTime.getHours();
    const minute = medTime.getMinutes();
    const notificationId = await scheduleWeeklyReminder({
      title: t("notifications.medBodyPrefix"),
      body: `${selectedMed}`,
      weekday: medWeekday,
      hour,
      minute,
    });
    addReminder({
      type: "medication",
      medName: selectedMed,
      weekday: medWeekday,
      hour,
      minute,
      notificationId,
    });
    setReminders(listReminders());
  }

  async function handleDelete(reminder: Reminder) {
    await cancelReminder(reminder.notification_id);
    deleteReminderRow(reminder.id);
    setReminders(listReminders());
  }

  function formatTime(h: number, m: number): string {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <CollapsibleSection
          title={t("notifications.addBpTitle")}
          defaultOpen={false}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            {t("notifications.day")}
          </Text>
          <Picker
            selectedValue={bpWeekday}
            onValueChange={setBpWeekday}
            style={{
              color: colors.text,
              backgroundColor: colors.inputBackground,
            }}
          >
            {weekdays.map((w) => (
              <Picker.Item key={w.value} label={w.label} value={w.value} />
            ))}
          </Picker>
          <DateTimePickerButton
            label={t("common.time")}
            mode="time"
            date={bpTime}
            onChange={setBpTime}
          />
          <MenuButton
            label={t("notifications.addBpButton")}
            variant="primary"
            onPress={handleAddBpReminder}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title={t("notifications.addMedTitle")}
          defaultOpen={false}
        >
          <Text style={[styles.label, { color: colors.text }]}>
            {t("notifications.medication")}
          </Text>
          <Picker
            selectedValue={selectedMed}
            onValueChange={setSelectedMed}
            style={{
              color: colors.text,
              backgroundColor: colors.inputBackground,
            }}
          >
            {medNames.length === 0 && (
              <Picker.Item label={t("medTracking.noActiveMed")} value="" />
            )}
            {medNames.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("notifications.day")}
          </Text>
          <Picker
            selectedValue={medWeekday}
            onValueChange={setMedWeekday}
            style={{
              color: colors.text,
              backgroundColor: colors.inputBackground,
            }}
          >
            {weekdays.map((w) => (
              <Picker.Item key={w.value} label={w.label} value={w.value} />
            ))}
          </Picker>
          <DateTimePickerButton
            label={t("common.time")}
            mode="time"
            date={medTime}
            onChange={setMedTime}
          />
          <MenuButton
            label={t("notifications.addMedButton")}
            variant="primary"
            onPress={handleAddMedReminder}
          />
        </CollapsibleSection>

        <Text style={[styles.listTitle, { color: colors.text }]}>
          {t("notifications.listTitle")}
        </Text>
        {reminders.length === 0 && (
          <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
            {t("notifications.empty")}
          </Text>
        )}
        {reminders.map((r) => (
          <View
            key={r.id}
            style={[
              styles.reminderRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>
                {r.type === "bp" ? t("notifications.bpLabel") : r.med_name}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {weekdayLabel(r.weekday, language)} —{" "}
                {formatTime(r.hour, r.minute)}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDelete(r)}
              style={styles.deleteButton}
            >
              <Text style={{ color: "#dc2626", fontWeight: "600" }}>
                {t("common.delete")}
              </Text>
            </Pressable>
          </View>
        ))}

        <MenuButton
          label={t("common.back")}
          variant="muted"
          onPress={() => router.back()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 4 },
  listTitle: { fontSize: 16, fontWeight: "700", marginTop: 8, marginBottom: 8 },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  deleteButton: { paddingHorizontal: 10, paddingVertical: 6 },
});
