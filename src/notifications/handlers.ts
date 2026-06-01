import { navigationRef } from "../navigation/ref";
import notifee, { EventType } from "@notifee/react-native";

function goToPuzzle(alarmId: string) {
  if (navigationRef.isReady()) {
    navigationRef.navigate("Puzzle", { alarmId });
  } else {
    console.warn("Navigation is not ready. Cannot navigate to Puzzle screen.");
  }
}

export function handleForegroundEvent({ type, detail }) {
  if (type === EventType.DELIVERED || type === EventType.PRESS) {
    const alarmId = detail.notification?.data?.alarmId;
    goToPuzzle(alarmId as string);
  }
}

export async function handleBackgroundEvent({ type, detail }) {
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
