import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { RootStackParamList } from "../../App";
import { loadAlarms, upsertAlarm } from "../storage";
import { Alarm } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmList">;

export default function AlarmListScreen({ navigation }: Props) {
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Reload alarms every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlarms().then(setAlarms);
    }, []),
  );

  const toggleEnabled = async (alarm: Alarm) => {
    const updated = { ...alarm, enabled: !alarm.enabled };
    const all = await upsertAlarm(updated);
    setAlarms(all);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={alarms}
        keyExtractor={(a) => a.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No alarms yet. Tap + to add one.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate("AlarmEdit", { alarmId: item.id })
            }
          >
            <View style={styles.rowText}>
              <Text style={styles.time}>{item.time}</Text>
              {item.label ? (
                <Text style={styles.label}>{item.label}</Text>
              ) : null}
            </View>
            <Switch
              value={item.enabled}
              onValueChange={() => toggleEnabled(item)}
            />
          </Pressable>
        )}
      />
      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate("AlarmEdit", {})}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  empty: { textAlign: "center", marginTop: 64, color: "#888" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  rowText: { flex: 1 },
  time: { fontSize: 32, fontWeight: "300" },
  label: { fontSize: 14, color: "#666", marginTop: 4 },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007aff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  addButtonText: { color: "#fff", fontSize: 28, lineHeight: 30 },
});
