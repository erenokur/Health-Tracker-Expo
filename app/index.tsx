import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useTheme } from "../src/theme/ThemeContext";
import { useLanguage } from "../src/i18n/LanguageContext";
import { listBpLogs } from "../src/db/bpLogs";
import { listMedLogs } from "../src/db/medLogs";
import { BpLog, MedLog } from "../src/types";
import { DataTable } from "../src/components/DataTable";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function MainScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16) + 16;

  const [filterDate, setFilterDate] = useState(new Date());
  const [bpLogs, setBpLogs] = useState<BpLog[]>([]);
  const [medLogs, setMedLogs] = useState<MedLog[]>([]);

  const [fabOpen, setFabOpen] = useState(false);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadData = useCallback(() => {
    const start = new Date(filterDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filterDate);
    end.setHours(23, 59, 59, 999);

    setBpLogs(listBpLogs({ start, end }));
    setMedLogs(listMedLogs({ start, end }));
  }, [filterDate]);

  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const isNewDay =
        today.getFullYear() !== filterDate.getFullYear() ||
        today.getMonth() !== filterDate.getMonth() ||
        today.getDate() !== filterDate.getDate();
      if (isNewDay) {
        setFilterDate(today);
      } else {
        loadData();
      }
    }, [loadData, filterDate]),
  );

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(fabAnim, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setFabOpen(!fabOpen);
  };

  const fabRotation = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const translateYMed = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -130],
  });

  const translateYBp = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -70],
  });

  const opacity = fabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  function navigateTo(path: any) {
    toggleFab();
    router.push(path);
  }

  const formatTime = (ts: string) => ts.split(" ")[1].substring(0, 5);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (event.type === "dismissed") return;
    if (selectedDate) setFilterDate(selectedDate);
  };

  const d = filterDate.getDate().toString().padStart(2, "0");
  const m = (filterDate.getMonth() + 1).toString().padStart(2, "0");
  const y = filterDate.getFullYear();
  const displayDate = `${d}.${m}.${y}`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* 50/50 Split View */}
      <View style={styles.flex}>
        {/* Medication List (Top Half) */}
        <View style={styles.flex}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("logMenu.med")}
          </Text>
          <DataTable
            data={medLogs}
            keyExtractor={(r) => r.id}
            onRowPress={(r) => router.push(`/med-log-edit?id=${r.id}` as any)}
            columns={[
              {
                header: t("common.time"),
                flex: 1,
                render: (r) => formatTime(r.timestamp),
              },
              {
                header: t("medLogs.colName"),
                flex: 1.5,
                render: (r) =>
                  r.med_name.length > 15
                    ? r.med_name.slice(0, 15) + "..."
                    : r.med_name,
              },
              { header: t("medLogs.colMeal"), render: (r) => r.meal_type },
            ]}
          />
        </View>

        {/* BP List (Bottom Half) */}
        <View
          style={[
            styles.flex,
            { borderTopWidth: 1, borderTopColor: colors.border },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 12 }]}
          >
            {t("logMenu.bp")}
          </Text>
          <DataTable
            data={bpLogs}
            keyExtractor={(r) => r.id}
            onRowPress={(r) => router.push(`/bp-log-edit?id=${r.id}` as any)}
            contentContainerStyle={{ paddingBottom: 100 }}
            columns={[
              {
                header: t("common.time"),
                flex: 1.2,
                render: (r) => formatTime(r.timestamp),
              },
              { header: t("bpLogs.colSys"), render: (r) => String(r.sys) },
              { header: t("bpLogs.colDia"), render: (r) => String(r.dia) },
              {
                header: t("bpLogs.colPulse"),
                render: (r) => (r.pulse != null ? String(r.pulse) : "-"),
              },
            ]}
          />
        </View>
      </View>

      {/* FAB Sub-buttons Overlay */}
      {fabOpen && <Pressable style={styles.overlay} onPress={toggleFab} />}

      {/* Absolute Bottom Controls (Date Picker & FAB) */}
      <View
        style={[styles.bottomControlsContainer, { bottom: bottomPadding }]}
        pointerEvents="box-none"
      >
        {/* Date Filter Button */}
        <Pressable
          style={[
            styles.dateButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              alignSelf: "flex-end",
            },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text
            style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}
          >
            📅 {displayDate}
          </Text>
        </Pressable>

        <View style={styles.flex} pointerEvents="none" />

        {/* Sub-FABs container mapped absolutely relative to Main FAB */}
        <View style={styles.fabWrapper} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.fabSubContainer,
              { opacity, transform: [{ translateY: translateYMed }] },
            ]}
          >
            <Pressable
              style={[styles.subFab, { backgroundColor: colors.primary }]}
              onPress={() => navigateTo("/med-tracking")}
            >
              <Text style={styles.subFabIcon}>💊</Text>
            </Pressable>
          </Animated.View>

          <Animated.View
            style={[
              styles.fabSubContainer,
              { opacity, transform: [{ translateY: translateYBp }] },
            ]}
          >
            <Pressable
              style={[styles.subFab, { backgroundColor: colors.primary }]}
              onPress={() => navigateTo("/bp-tracking")}
            >
              <Text style={styles.subFabIcon}>❤️</Text>
            </Pressable>
          </Animated.View>

          {/* Main FAB */}
          <Animated.View
            style={[
              styles.fab,
              {
                transform: [{ rotate: fabRotation }],
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Pressable onPress={toggleFab} style={styles.fabPressable}>
              <Text style={styles.fabIcon}>+</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 10,
  },
  bottomControlsContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 200,
    flexDirection: "row",
    alignItems: "flex-end",
    zIndex: 12,
  },
  dateButton: {
    height: 56,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 28,
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  fabWrapper: {
    width: 56,
    height: 200,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  fabSubContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    right: 0,
    bottom: 0,
    zIndex: 11,
  },
  fabLabel: {
    marginRight: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    overflow: "hidden",
    fontWeight: "600",
  },
  subFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  subFabIcon: { fontSize: 20 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    zIndex: 12,
  },
  fabPressable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fabIcon: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
    marginTop: -2,
  },
});
