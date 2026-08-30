import {
  requireNativeModule,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

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

/**
 * Pushes the active medication name list to the paired Wear OS watch via
 * DataClient. The watch will display this as a chip picker in MedScreen.
 *
 * Call this whenever the user's active medication list changes
 * (add, remove, activate, or deactivate a medication).
 *
 * @param names - Array of active medication name strings, e.g. ["Aspirin", "Metformin"]
 */
export async function syncMedicineList(names: string[]): Promise<void> {
  return WearBridge.syncMedicineList(names);
}
