import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidLaunchActivityFlag,
  AndroidVisibility,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import { Alarm } from "../types";
import { ALARM_CHANNEL_ID } from "./setup";
import { loadAlarms } from "../storage";

// Compute the next time the alarm should fire.
// If `dayOfWeek` is undefined: one-shot, next occurrence today or tomorrow.
// Otherwise: next occurrence on that specific weekday.
function nextFireTime(
  alarm: Alarm,
  dayOfWeek: number | undefined,
  now: Date = new Date(),
): number {
  const [h, m] = alarm.time.split(":").map(Number);
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);

  if (dayOfWeek === undefined) {
    if (candidate.getTime() <= now.getTime()) {
      candidate.setDate(candidate.getDate() + 1);
    }
    return candidate.getTime();
  }

  while (
    candidate.getDay() !== dayOfWeek ||
    candidate.getTime() <= now.getTime()
  ) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.getTime();
}

function notificationIdFor(alarmId: string, day?: number): string {
  return day === undefined ? `alarm-${alarmId}` : `alarm-${alarmId}-${day}`;
}

function allPossibleIdsFor(alarmId: string): string[] {
  return [
    notificationIdFor(alarmId),
    ...[0, 1, 2, 3, 4, 5, 6].map((d) => notificationIdFor(alarmId, d)),
  ];
}

function buildNotification(alarm: Alarm, day?: number) {
  return {
    id: notificationIdFor(alarm.id, day),
    title: alarm.label || "Alarm",
    body: "Solve to dismiss",
    data: { alarmId: alarm.id },
    android: {
      channelId: ALARM_CHANNEL_ID,
      category: AndroidCategory.ALARM,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      pressAction: {
        id: "default",
        launchActivity: "default",
        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
      },
      fullScreenAction: {
        id: "default",
        launchActivity: "default",
        launchActivityFlags: [AndroidLaunchActivityFlag.SINGLE_TOP],
      },
      loopSound: true,
      ongoing: true,
      autoCancel: false,
    },
  };
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  if (!alarm.enabled) return;

  if (alarm.repeatDays.length === 0) {
    // One-shot
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: nextFireTime(alarm, undefined),
      alarmManager: { allowWhileIdle: true },
    };
    await notifee.createTriggerNotification(buildNotification(alarm), trigger);
    return;
  }

  // Repeating: one weekly-repeating trigger per selected weekday
  await Promise.all(
    alarm.repeatDays.map(async (day) => {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: nextFireTime(alarm, day),
        repeatFrequency: RepeatFrequency.WEEKLY,
        alarmManager: { allowWhileIdle: true },
      };
      await notifee.createTriggerNotification(
        buildNotification(alarm, day),
        trigger,
      );
    }),
  );
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  await Promise.all(
    allPossibleIdsFor(alarmId).map((id) =>
      notifee.cancelTriggerNotification(id),
    ),
  );
}

export async function cancelDisplayedFor(alarmId: string): Promise<void> {
  await Promise.all(
    allPossibleIdsFor(alarmId).map((id) =>
      notifee.cancelDisplayedNotification(id),
    ),
  );
}

export async function rescheduleAlarm(alarm: Alarm): Promise<void> {
  await cancelAlarm(alarm.id);
  if (alarm.enabled) await scheduleAlarm(alarm);
}

export async function restoreAllAlarms(): Promise<void> {
  const alarms = await loadAlarms();
  await Promise.all(
    alarms.map(async (alarm) => {
      if (alarm.enabled) {
        await rescheduleAlarm(alarm).catch((error) => {
          console.error(`Failed to reschedule alarm ${alarm.id}:`, error);
        });
      }
    }),
  );
}
