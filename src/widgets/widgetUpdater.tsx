import React from "react";
import { requestWidgetUpdate } from "react-native-android-widget";
import { LatestBpWidget, WidgetLogItem } from "./LatestBpWidget";
import { db } from "../db/database";

export async function refreshWidgetUI() {
  try {
    const bpRows = db.getAllSync<any>(
      "SELECT id, timestamp, sys, dia, pulse FROM bp_logs WHERE deleted = 0 AND timestamp LIKE ? ORDER BY timestamp DESC LIMIT 8",
      [likeParam],
    );
    const medRows = db.getAllSync<any>();

    const combined: WidgetLogItem[] = [
      ...bpRows.map((r) => ({
        type: "bp" as const,
        id: r.id,
        timestamp: r.timestamp,
        sys: r.sys,
        dia: r.dia,
        pulse: r.pulse,
      })),
      ...medRows.map((r) => ({
        type: "med" as const,
        id: r.id,
        timestamp: r.timestamp,
        medName: r.med_name,
        mealType: r.meal_type,
      })),
    ];

    combined.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
    const recentLogs = combined.slice(0, 8);

    await requestWidgetUpdate({
      widgetName: "LatestBp",
      renderWidget: () => <LatestBpWidget logs={recentLogs} />,
      widgetNotFound: () => {},
    });
  } catch (e) {
    console.error("Widget update failed", e);
  }
}
