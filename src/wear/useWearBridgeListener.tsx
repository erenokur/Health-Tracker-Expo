import { useEffect } from "react";
import { Platform } from "react-native";
import {
  addBpMessageListener,
  addMedMessageListener,
  WearBpMessage,
  WearMedMessage,
} from "wear-bridge";
import { addBpLog } from "../db/bpLogs";
import { addMedLog } from "../db/medLogs";

// Watch sends "yyyy-MM-dd HH:mm:ss" (see PhoneSync usages in the Wear app) —
// parsed manually since Hermes doesn't reliably parse that format via
// `new Date(string)`.
function parseWatchTimestamp(ts: string): Date {
  const [datePart, timePart] = ts.split(" ");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm, ss] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss ?? 0);
}

import { refreshWidgetUI } from "../widgets/widgetUpdater";

/**
 * Call once near the app root (see app/_layout.tsx). Subscribes for the
 * lifetime of the app; the native WearMessageListenerService keeps working
 * even if this component briefly isn't mounted, since it buffers into
 * WearBridgeEvents on the native side regardless.
 */
export function useWearBridgeListener() {
  useEffect(() => {
    if (Platform.OS !== "android") return;

    const bpSub = addBpMessageListener((event: WearBpMessage) => {
      addBpLog({
        sys: event.sys,
        dia: event.dia,
        pulse: event.pulse,
        note: event.note || "(Saatten)",
        customDate: parseWatchTimestamp(event.timestamp),
      });
      refreshWidgetUI();
    });

    const medSub = addMedMessageListener((event: WearMedMessage) => {
      addMedLog(
        event.medName,
        event.mealType,
        parseWatchTimestamp(event.timestamp),
      );
      refreshWidgetUI();
    });

    return () => {
      bpSub.remove();
      medSub.remove();
    };
  }, []);
}
