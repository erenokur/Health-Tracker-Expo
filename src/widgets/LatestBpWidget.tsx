import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

// Note: these are NOT real React Native components — react-native-android-widget
// renders these to native Android RemoteViews, so only its own supported style
// properties work here (no arbitrary React Native styling, no ScrollView, etc).

interface Props {
  sys?: number | null;
  dia?: number | null;
  pulse?: number | null;
  timestamp?: string | null;
}

export function LatestBpWidget({ sys, dia, pulse, timestamp }: Props) {
  const hasData = sys != null && dia != null;

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#1E293B",
        borderRadius: 16,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="OPEN_APP"
    >
      {hasData ? (
        <>
          <TextWidget
            text={`${sys}/${dia}`}
            style={{ fontSize: 28, fontWeight: "bold", color: "#ffffff" }}
          />
          <TextWidget
            text={pulse != null ? `Nabız: ${pulse}` : "Nabız: -"}
            style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}
          />
          <TextWidget
            text={timestamp ?? ""}
            style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}
          />
        </>
      ) : (
        <TextWidget
          text="Henüz kayıt yok"
          style={{ fontSize: 14, color: "#94a3b8" }}
        />
      )}
    </FlexWidget>
  );
}
