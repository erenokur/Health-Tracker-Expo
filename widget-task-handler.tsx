import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { LatestBpWidget, WidgetLogItem } from "./src/widgets/LatestBpWidget";
import { db, initDb } from "./src/db/database";

const nameToWidget = {
  LatestBp: LatestBpWidget,
};

function ErrorFallbackWidget({ message }: { message: string }) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#7f1d1d",
        borderRadius: 16,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={`Widget hatası: ${message}`}
        style={{ fontSize: 12, color: "#ffffff" }}
      />
    </FlexWidget>
  );
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];
  if (!Widget) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      try {
        initDb();
        
        const d = new Date();
        const todayPrefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const likeParam = todayPrefix + "%";

        // Fetch last 8 BP logs for today
        const bpRows = db.getAllSync<any>(
          "SELECT id, timestamp, sys, dia, pulse FROM bp_logs WHERE deleted = 0 AND timestamp LIKE ? ORDER BY timestamp DESC LIMIT 8",
          [likeParam]
        );
        // Fetch last 8 Med logs for today
        const medRows = db.getAllSync<any>(
          "SELECT id, timestamp, med_name, meal_type FROM med_logs WHERE deleted = 0 AND timestamp LIKE ? ORDER BY timestamp DESC LIMIT 8",
          [likeParam]
        );
        
        const combined: WidgetLogItem[] = [
          ...bpRows.map(r => ({ type: "bp" as const, id: r.id, timestamp: r.timestamp, sys: r.sys, dia: r.dia, pulse: r.pulse })),
          ...medRows.map(r => ({ type: "med" as const, id: r.id, timestamp: r.timestamp, medName: r.med_name, mealType: r.meal_type }))
        ];
        
        // Sort by timestamp descending
        combined.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
        
        // Take top 8 total
        const recentLogs = combined.slice(0, 8);

        props.renderWidget(
          React.createElement(Widget, {
            logs: recentLogs,
          }),
        );
      } catch (e: any) {
        props.renderWidget(
          React.createElement(ErrorFallbackWidget, {
            message: String(e?.message ?? e).slice(0, 80),
          }),
        );
      }
      break;
    }
    case "WIDGET_DELETED":
    case "WIDGET_CLICK":
    default:
      break;
  }
}
