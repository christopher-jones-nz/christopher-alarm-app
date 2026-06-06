import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AlarmListScreen from "./src/screens/AlarmListScreen";
import AlarmEditScreen from "./src/screens/AlarmEditScreen";
import PuzzleScreen from "./src/screens/PuzzleScreen";
import { setupNotifications } from "./src/notifications/setup";
import notifee from "@notifee/react-native";
import {
  handleForegroundEvent,
  initFromKilledState,
} from "./src/notifications/handlers";
import { navigationRef } from "./src/navigation/ref";
import { restoreAllAlarms } from "./src/notifications/scheduler";

export type RootStackParamList = {
  AlarmList: undefined;
  AlarmEdit: { alarmId?: string };
  Puzzle: { alarmId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    (async () => {
      await setupNotifications();
      await restoreAllAlarms();
    })();
    const unsubscribe = notifee.onForegroundEvent(handleForegroundEvent);
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => initFromKilledState()}
    >
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="AlarmList">
        <Stack.Screen
          name="AlarmList"
          component={AlarmListScreen}
          options={{ title: "Alarms" }}
        />
        <Stack.Screen
          name="AlarmEdit"
          component={AlarmEditScreen}
          options={{ title: "Edit Alarm" }}
        />
        <Stack.Screen
          name="Puzzle"
          component={PuzzleScreen}
          options={{ title: "Solve to Dismiss", headerBackVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
