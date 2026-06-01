import notifee, { AndroidImportance } from "@notifee/react-native";

export const ALARM_CHANNEL_ID = "alarms";

export async function setupNotifications(): Promise<void> {
  // Request permission (Android 13+ requires this at runtime)
  await notifee.requestPermission();

  // Create the alarm notification channel
  await notifee.createChannel({
    id: ALARM_CHANNEL_ID,
    name: "Alarms",
    importance: AndroidImportance.HIGH,
    sound: "default",
    vibration: true,
    vibrationPattern: [500, 500, 500, 500],
    bypassDnd: true,
  });
}
