import { db } from "./database";
import { newId, nowIso } from "./uuid";

export type ReminderType = "bp" | "medication";

export interface Reminder {
  id: string;
  type: ReminderType;
  med_name: string | null;
  weekday: number; // 1-7, 1 = Sunday
  hour: number;
  minute: number;
  notification_id: string;
  created_at: string;
}

export function listReminders(): Reminder[] {
  return db.getAllSync<Reminder>(
    "SELECT * FROM reminders ORDER BY weekday ASC, hour ASC, minute ASC",
  );
}

export interface AddReminderInput {
  type: ReminderType;
  medName?: string | null;
  weekday: number;
  hour: number;
  minute: number;
  notificationId: string;
}

// No uniqueness constraint on purpose — multiple reminders for the same
// weekday (BP) or the same medication (medication reminders) are allowed,
// per request. Every add just appends a new row.
export function addReminder(input: AddReminderInput): void {
  db.runSync(
    `INSERT INTO reminders (id, type, med_name, weekday, hour, minute, notification_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newId(),
      input.type,
      input.medName ?? null,
      input.weekday,
      input.hour,
      input.minute,
      input.notificationId,
      nowIso(),
    ],
  );
}

export function deleteReminderRow(id: string): void {
  db.runSync("DELETE FROM reminders WHERE id = ?", [id]);
}

export function getReminder(id: string): Reminder | null {
  return db.getFirstSync<Reminder>("SELECT * FROM reminders WHERE id = ?", [id]);
}
