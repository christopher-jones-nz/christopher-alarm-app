import { Difficulty, MathProblem } from "../types";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateProblem(difficulty: Difficulty): MathProblem {
  switch (difficulty) {
    case "easy": {
      // Single-digit + or -
      const op = pick(["+", "-"]);
      const a = randInt(1, 9);
      const b = randInt(1, 9);
      if (op === "+") return { question: `${a} + ${b}`, answer: a + b };
      // Ensure non-negative result
      const [x, y] = a >= b ? [a, b] : [b, a];
      return { question: `${x} - ${y}`, answer: x - y };
    }

    case "medium": {
      // Two-digit + / -, or single-digit ×
      const op = pick(["+", "-", "×"]);
      if (op === "×") {
        const a = randInt(2, 9);
        const b = randInt(2, 9);
        return { question: `${a} × ${b}`, answer: a * b };
      }
      const a = randInt(10, 99);
      const b = randInt(10, 99);
      if (op === "+") return { question: `${a} + ${b}`, answer: a + b };
      const [x, y] = a >= b ? [a, b] : [b, a];
      return { question: `${x} - ${y}`, answer: x - y };
    }

    case "hard": {
      const kind = pick(["mul", "chain"]);
      if (kind === "mul") {
        const a = randInt(11, 25);
        const b = randInt(11, 25);
        return { question: `${a} × ${b}`, answer: a * b };
      }
      // Three-term chain, kept non-negative at every step
      let a = randInt(20, 99);
      let b = randInt(20, 99);
      const op1 = pick(["+", "-"]);
      if (op1 === "-" && a < b) [a, b] = [b, a];
      const v1 = op1 === "+" ? a + b : a - b;

      const op2 = pick(["+", "-"]);
      const c = op2 === "-" ? randInt(1, Math.max(1, v1)) : randInt(20, 99);
      const v2 = op2 === "+" ? v1 + c : v1 - c;
      return { question: `${a} ${op1} ${b} ${op2} ${c}`, answer: v2 };
    }
  }
}

export function generateProblems(
  difficulty: Difficulty,
  count: number,
): MathProblem[] {
  return Array.from({ length: count }, () => generateProblem(difficulty));
}
