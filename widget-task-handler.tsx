import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { LatestBpWidget } from "./src/widgets/LatestBpWidget";
import { getLatestBpLog } from "./src/db/bpLogs";
import { initDb } from "./src/db/database";

const nameToWidget = {
  LatestBp: LatestBpWidget,
};

// If anything above throws, we still render *something* visible instead of
// leaving Android showing its blank/placeholder layout with only the
// default click intent attached (which looks exactly like "transparent
// buttons that still open the app").
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
        // This handler runs in its own headless JS context, separate from
        // the main app's — the DB connection from app/_layout.tsx doesn't
        // carry over, so we open/init it again here. expo-sqlite handles
        // concurrent access from both contexts fine since they're both
        // just reading.
        initDb();
        const latest = getLatestBpLog();
        props.renderWidget(
          React.createElement(Widget, {
            sys: latest?.sys,
            dia: latest?.dia,
            pulse: latest?.pulse ?? null,
            timestamp: latest?.timestamp,
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
