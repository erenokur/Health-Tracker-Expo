import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = "reminders";

/**
 * Requests permission and (on Android) creates the notification channel.
 * Safe to call repeatedly — getPermissionsAsync short-circuits if already
 * granted, and setNotificationChannelAsync is idempotent.
 */
export async function ensureNotificationSetup(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Hatırlatıcılar",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  return final === "granted";
}

export interface WeeklyReminderParams {
  title: string;
  body: string;
  weekday: number; // 1-7, 1 = Sunday
  hour: number;
  minute: number;
}

export async function scheduleWeeklyReminder(
  params: WeeklyReminderParams,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: params.title,
      body: params.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: params.weekday,
      hour: params.hour,
      minute: params.minute,
      channelId: CHANNEL_ID,
    },
  });
}

export async function cancelReminder(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
