import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { LatestBpWidget } from "./src/widgets/LatestBpWidget";
import { getLatestBpLog } from "./src/db/bpLogs";
import { initDb } from "./src/db/database";

const nameToWidget = {
  LatestBp: LatestBpWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const Widget =
    nameToWidget[widgetInfo.widgetName as keyof typeof nameToWidget];
  if (!Widget) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      // This handler runs in its own headless JS context, separate from the
      // main app's — the DB connection from app/_layout.tsx doesn't carry
      // over, so we open/init it again here. expo-sqlite handles concurrent
      // access from both contexts fine since they're both just reading.
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
      break;
    }
    case "WIDGET_DELETED":
    case "WIDGET_CLICK":
    default:
      break;
  }
}
