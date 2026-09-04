import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export type WidgetLogItem =
  | { type: "bp"; id: string; timestamp: string; sys: number; dia: number; pulse: number | null }
  | { type: "med"; id: string; timestamp: string; medName: string; mealType: string };

interface Props {
  logs?: WidgetLogItem[];
}

export function LatestBpWidget({ logs = [] }: Props) {
  const hasData = logs.length > 0;

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: "#1E293B",
          borderRadius: 16,
          padding: 12,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logs List Area */}
        <FlexWidget
          style={{ flex: 1, width: "match_parent", flexDirection: "column", justifyContent: "flex-start" }}
        >
          {hasData ? (
            logs.map((log) => {
              const isBp = log.type === "bp";
              const time = log.timestamp.split(" ")[1].substring(0, 5); // extract HH:mm
              const bgColor = isBp ? "#16A34A" : "#0284c7";
              
              // BP format: "120/80 (Nabız: 72)"
              // Med format: "Aspirin (Tok)"
              let infoText = "";
              if (isBp) {
                const pulseStr = log.pulse != null ? ` (N: ${log.pulse})` : "";
                infoText = `${log.sys}/${log.dia}${pulseStr}`;
              } else {
                infoText = `${log.medName} (${log.mealType})`;
              }

              return (
                <FlexWidget
                  key={log.id}
                  style={{
                    width: "match_parent",
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: bgColor,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    marginBottom: 4,
                  }}
                >
                  <TextWidget
                    text={time}
                    style={{ fontSize: 13, fontWeight: "bold", color: "#ffffff", marginRight: 8 }}
                  />
                  <TextWidget
                    text={infoText}
                    style={{ fontSize: 13, color: "#ffffff", flex: 1 }}
                  />
                </FlexWidget>
              );
            })
          ) : (
            <FlexWidget style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
              <TextWidget
                text="Henüz kayıt yok"
                style={{ fontSize: 14, color: "#94a3b8" }}
              />
            </FlexWidget>
          )}
        </FlexWidget>

        {/* Bottom Quick Action Buttons */}
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "match_parent",
            marginTop: 8,
          }}
        >
          <FlexWidget
            clickAction="OPEN_URI"
            clickActionData={{ uri: "healthtracker://bp-tracking" }}
            style={{
              backgroundColor: "#16A34A",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flex: 1,
              marginRight: 4,
              alignItems: "center",
            }}
          >
            <TextWidget
              text="+ Tansiyon"
              style={{ color: "#ffffff", fontSize: 13, fontWeight: "bold" }}
            />
          </FlexWidget>

          <FlexWidget
            clickAction="OPEN_URI"
            clickActionData={{ uri: "healthtracker://med-tracking" }}
            style={{
              backgroundColor: "#0284c7",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              flex: 1,
              marginLeft: 4,
              alignItems: "center",
            }}
          >
            <TextWidget
              text="+ İlaç"
              style={{ color: "#ffffff", fontSize: 13, fontWeight: "bold" }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
