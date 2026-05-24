export type Difficulty = "easy" | "medium" | "hard";

export type Alarm = {
  id: string;
  time: string; // "HH:MM" 24h, e.g. "07:30"
  label?: string;
  enabled: boolean;
  repeatDays: number[]; // 0=Sun, 1=Mon, ... 6=Sat. [] = one-shot.
  difficulty: Difficulty;
  sound: string;
};

export type MathProblem = {
  question: string; // "12 + 7"
  answer: number; // 19
};

export const PROBLEMS_PER_ALARM = 3;
