import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { RootStackParamList } from "../../App";
import { deleteAlarm, loadAlarms, upsertAlarm } from "../storage";
import { Alarm, Difficulty } from "../types";
import { cancelAlarm, rescheduleAlarm } from "../notifications/scheduler";
import notifee from "@notifee/react-native";

type Props = NativeStackScreenProps<RootStackParamList, "AlarmEdit">;

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

function newAlarmId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function emptyAlarm(): Alarm {
  return {
    id: newAlarmId(),
    time: "07:00",
    label: "",
    enabled: true,
    repeatDays: [],
    difficulty: "easy",
    sound: "default",
  };
}

// "HH:MM" -> Date today at that time. Used to seed the picker.
function timeStringToDate(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

// Date -> "HH:MM" (24h, zero-padded). Used to store the result.
function dateToTimeString(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AlarmEditScreen({ navigation, route }: Props) {
  const editingId = route.params?.alarmId;
  const [alarm, setAlarm] = useState<Alarm>(emptyAlarm);
  const [loading, setLoading] = useState(!!editingId);
  // Android shows the picker as a modal; iOS shows it inline.
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");

  useEffect(() => {
    if (!editingId) return;
    loadAlarms().then((all) => {
      const found = all.find((a) => a.id === editingId);
      if (found) setAlarm(found);
      setLoading(false);
    });
  }, [editingId]);

  const pickerDate = useMemo(() => timeStringToDate(alarm.time), [alarm.time]);

  const setField = <K extends keyof Alarm>(key: K, value: Alarm[K]) => {
    setAlarm((prev) => ({ ...prev, [key]: value }));
  };

  const onValueChange = (event: any, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selected) return;
    setField("time", dateToTimeString(selected));
  };

  const toggleDay = (day: number) => {
    setAlarm((prev) => ({
      ...prev,
      repeatDays: prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day].sort(),
    }));
  };

  const save = async () => {
    await upsertAlarm(alarm);
    await rescheduleAlarm(alarm);
    console.log("Triggers:", await notifee.getTriggerNotifications());
    navigation.goBack();
  };

  const remove = async () => {
    if (!editingId) return;
    Alert.alert("Delete alarm", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAlarm(editingId);
          await cancelAlarm(editingId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return <View style={styles.container} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.fieldLabel}>Time</Text>
      {Platform.OS === "android" ? (
        <Pressable
          style={styles.timeDisplay}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.timeText}>{alarm.time}</Text>
        </Pressable>
      ) : null}
      {showPicker ? (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onValueChange={onValueChange}
        />
      ) : null}

      <Text style={styles.fieldLabel}>Label</Text>
      <TextInput
        style={styles.input}
        value={alarm.label}
        onChangeText={(t) => setField("label", t)}
        placeholder="Wake up"
      />

      <Text style={styles.fieldLabel}>Repeat</Text>
      <View style={styles.daysRow}>
        {DAY_LABELS.map((label, i) => {
          const active = alarm.repeatDays.includes(i);
          return (
            <Pressable
              key={i}
              style={[styles.day, active && styles.dayActive]}
              onPress={() => toggleDay(i)}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Difficulty</Text>
      <View style={styles.daysRow}>
        {DIFFICULTIES.map((d) => {
          const active = alarm.difficulty === d;
          return (
            <Pressable
              key={d}
              style={[styles.diff, active && styles.dayActive]}
              onPress={() => setField("difficulty", d)}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.fieldLabel}>Enabled</Text>
        <Switch
          value={alarm.enabled}
          onValueChange={(v) => setField("enabled", v)}
        />
      </View>

      <Pressable style={styles.saveButton} onPress={save}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>

      {editingId ? (
        <Pressable style={styles.deleteButton} onPress={remove}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  fieldLabel: { fontSize: 14, color: "#666", marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
  },
  timeDisplay: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  timeText: { fontSize: 32, fontWeight: "300" },
  daysRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  day: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  diff: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  dayActive: { backgroundColor: "#007aff", borderColor: "#007aff" },
  dayText: { color: "#333" },
  dayTextActive: { color: "#fff", fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: "#007aff",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  deleteButton: { marginTop: 16, padding: 16, alignItems: "center" },
  deleteButtonText: { color: "#d33", fontSize: 16 },
});
