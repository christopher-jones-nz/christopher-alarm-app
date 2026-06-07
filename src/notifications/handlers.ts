import { navigationRef } from "../navigation/ref";
import notifee, { Event, EventType } from "@notifee/react-native";
import { cancelDisplayedFor } from "./scheduler";

function goToPuzzle(alarmId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate("Puzzle", { alarmId });
  } else {
    console.warn("Navigation is not ready. Cannot navigate to Puzzle screen.");
  }
}

export async function handleForegroundEvent({ type, detail }: Event) {
  if (type === EventType.DELIVERED || type === EventType.PRESS) {
    const alarmId = detail.notification?.data?.alarmId;
    if (!alarmId) return;
    // App is open — kill the banner immediately, just go to puzzle
    await cancelDisplayedFor(alarmId as string);
    goToPuzzle(alarmId as string);
  }
}

export async function handleBackgroundEvent({ type, detail }: Event) {
  if (type === EventType.DELIVERED || type === EventType.PRESS) {
    const alarmId = detail.notification?.data?.alarmId;
    goToPuzzle(alarmId as string);
  }
}

export async function initFromKilledState() {
  const initialNotification = await notifee.getInitialNotification();
  if (initialNotification) {
    const alarmId = initialNotification.notification?.data?.alarmId;
    goToPuzzle(alarmId as string);
  }
}
