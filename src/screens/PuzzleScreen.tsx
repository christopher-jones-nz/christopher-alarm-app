import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RootStackParamList } from "../../App";
import { generateProblems } from "../math/generator";
import { loadAlarms } from "../storage";
import { Alarm, MathProblem, PROBLEMS_PER_ALARM } from "../types";
import { cancelDisplayedFor } from "../notifications/scheduler";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

type Props = NativeStackScreenProps<RootStackParamList, "Puzzle">;

export default function PuzzleScreen({ navigation, route }: Props) {
  const { alarmId } = route.params;
  const [alarm, setAlarm] = useState<Alarm | null>(null);
  const [problems, setProblems] = useState<MathProblem[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [wrongFlash, setWrongFlash] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const player = useAudioPlayer(
    require("../../assets/sounds/stan_walker_mo_ake_tonu_18s.mp3"),
  );

  // Load the alarm, then generate problems based on its difficulty
  useEffect(() => {
    loadAlarms().then((all) => {
      const found = all.find((a) => a.id === alarmId);
      if (!found) {
        navigation.goBack();
        return;
      }
      setAlarm(found);
      setProblems(generateProblems(found.difficulty, PROBLEMS_PER_ALARM));
    });
  }, [alarmId]);

  // Block the Android hardware back button while the puzzle is up
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let fadeTimer: ReturnType<typeof setInterval> | null = null;

    (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "doNotMix",
        shouldPlayInBackground: false,
      });
      if (cancelled) return;

      player.loop = true;
      player.volume = 0.2;
      player.play();

      let i = 0;
      const steps = 60;
      fadeTimer = setInterval(() => {
        i += 1;
        player.volume = Math.min(0.2 + (0.8 * i) / steps, 1.0);
        if (i >= steps && fadeTimer) clearInterval(fadeTimer);
      }, 1000);
    })();

    return () => {
      cancelled = true;
      if (fadeTimer) clearInterval(fadeTimer);
      try {
        player.pause();
      } catch {
        // Player may already be released by the hook
      }
    };
  }, [player]);

  const current = problems[index];

  const onSubmit = async () => {
    if (!current) return;
    const parsed = parseInt(input, 10);
    if (Number.isNaN(parsed)) return;

    if (parsed === current.answer) {
      const next = index + 1;
      setInput("");
      if (next >= problems.length) {
        // Solved everything — dismiss the alarm
        if (alarm) {
          await cancelDisplayedFor(alarm.id);
        }
        navigation.goBack();
      } else {
        setIndex(next);
      }
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 300);
      setInput("");
      inputRef.current?.focus();
    }
  };

  const progressDots = useMemo(
    () =>
      problems.map((_, i) => (
        <View key={i} style={[styles.dot, i < index && styles.dotDone]} />
      )),
    [problems, index],
  );

  if (!alarm || !current) {
    return <View style={styles.container} />;
  }

  return (
    <View style={[styles.container, wrongFlash && styles.containerWrong]}>
      <View style={styles.progress}>{progressDots}</View>

      {alarm.label ? <Text style={styles.label}>{alarm.label}</Text> : null}

      <Text style={styles.question}>{current.question}</Text>

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={input}
        onChangeText={(t) => setInput(t.replace(/[^0-9]/g, ""))}
        onSubmitEditing={onSubmit}
        keyboardType="number-pad"
        autoFocus
        returnKeyType="done"
        submitBehavior="submit"
        placeholder="?"
        placeholderTextColor="#666"
      />

      <Text style={styles.hint}>
        Problem {index + 1} of {problems.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  containerWrong: { backgroundColor: "#5a1a1a" },
  progress: {
    flexDirection: "row",
    gap: 12,
    position: "absolute",
    top: 24,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#888",
  },
  dotDone: { backgroundColor: "#4caf50", borderColor: "#4caf50" },
  label: { color: "#aaa", fontSize: 16, marginBottom: 24 },
  question: {
    color: "#fff",
    fontSize: 56,
    fontWeight: "300",
    marginBottom: 32,
  },
  input: {
    color: "#fff",
    fontSize: 48,
    borderBottomWidth: 2,
    borderBottomColor: "#444",
    minWidth: 200,
    textAlign: "center",
    padding: 8,
  },
  hint: { color: "#666", marginTop: 32 },
});
