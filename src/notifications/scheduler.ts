import notifee, {
  AndroidCategory,
  AndroidImportance,
  AndroidLaunchActivityFlag,
  AndroidVisibility,
  TimestampTrigger,
  TriggerType,
} from "@notifee/react-native";
import { Alarm } from "../types";
import { ALARM_CHANNEL_ID } from "./setup";
import { loadAlarms } from "../storage";

// Compute the next time this alarm should fire (UTC ms epoch).
// If repeatDays is empty: next occurrence today or tomorrow.
// If non-empty: next matching weekday.
function nextFireTime(alarm: Alarm, now: Date = new Date()): number {
  const [h, m] = alarm.time.split(":").map(Number);
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);

  if (alarm.repeatDays.length === 0) {
    if (candidate.getTime() <= now.getTime()) {
      candidate.setDate(candidate.getDate() + 1);
    }
    return candidate.getTime();
  }

  // Repeating: find the next day-of-week that matches and is in the future
  for (let i = 0; i < 8; i++) {
    const day = candidate.getDay();
    if (alarm.repeatDays.includes(day) && candidate.getTime() > now.getTime()) {
      return candidate.getTime();
    }
    candidate.setDate(candidate.getDate() + 1);
  }
  // Shouldn't reach here if repeatDays is non-empty
  return candidate.getTime();
}

function notificationIdFor(alarm: Alarm): string {
  return `alarm-${alarm.id}`;
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  if (!alarm.enabled) return;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: nextFireTime(alarm),
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      id: notificationIdFor(alarm),
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
    },
    trigger,
  );
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  await notifee.cancelTriggerNotification(`alarm-${alarmId}`);
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
