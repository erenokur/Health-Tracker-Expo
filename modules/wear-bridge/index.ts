import { requireNativeModule, EventEmitter, Subscription } from "expo-modules-core";

const WearBridge = requireNativeModule("WearBridge");
const emitter = new EventEmitter(WearBridge as any);

export interface WearBpMessage {
  sys: number;
  dia: number;
  pulse: number | null;
  timestamp: string;
  note: string;
}

export interface WearMedMessage {
  medName: string;
  mealType: "Aç" | "Tok";
  timestamp: string;
}

/**
 * Fires whenever the Wear OS app sends a "/bp-log" message via the
 * Wearable Data Layer API. Payload is already-parsed JSON.
 */
export function addBpMessageListener(
  listener: (event: WearBpMessage) => void,
): Subscription {
  return emitter.addListener("onWearBpLog", listener);
}

/**
 * Fires whenever the Wear OS app sends a "/med-log" message.
 */
export function addMedMessageListener(
  listener: (event: WearMedMessage) => void,
): Subscription {
  return emitter.addListener("onWearMedLog", listener);
}
