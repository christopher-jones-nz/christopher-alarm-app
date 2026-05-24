import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AlarmListScreen from "./src/screens/AlarmListScreen";
import AlarmEditScreen from "./src/screens/AlarmEditScreen";
import PuzzleScreen from "./src/screens/PuzzleScreen";

export type RootStackParamList = {
  AlarmList: undefined;
  AlarmEdit: { alarmId?: string };
  Puzzle: { alarmId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
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
