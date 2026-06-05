export interface ScoringResult {
  rawScore: number;
  displayScore: number;
  calculatedLevel: number;
  finalLevel: number;
  alerts: string[];
  questionCount: number;
  pointsPerQuestion: number;
}

export const OPTION_VALUES: number[] = [1, 3, 5];
const MAX_OPTION_VALUE = 5;

const LEVEL_THRESHOLDS = [36, 52, 68, 84];

export function calculateScore(
  answers: Record<string, number>,
  questionCount: number
): ScoringResult {
  let rawScore = 0;
  const alerts: string[] = [];

  for (let i = 1; i <= questionCount; i++) {
    const answerIndex = answers[`q${i}`];
    if (answerIndex !== undefined && answerIndex >= 0 && answerIndex <= 2) {
      rawScore += OPTION_VALUES[answerIndex];
    }
  }

  const maxPossible = questionCount * MAX_OPTION_VALUE;
  const displayScore = maxPossible > 0 ? Math.round((rawScore / maxPossible) * 100) : 0;
  const pointsPerQuestion = questionCount > 0 ? 100 / questionCount : 0;

  const calculatedLevel = getLevel(displayScore);
  let finalLevel = calculatedLevel;

  const q1Answer = answers['q1'];
  if (q1Answer === 0 && calculatedLevel >= 4) {
    finalLevel = 3;
    alerts.push("Tu visión estratégica es alta, pero la base contable limita tu nivel real. Es fundamental fortalecer los cimientos antes de avanzar.");
  }

  const q5Answer = answers['q5'];
  if (q5Answer !== 2 && calculatedLevel === 5) {
    if (finalLevel > 4) {
      finalLevel = 4;
    }
    alerts.push("Para alcanzar el Nivel 5, la dirección financiera debe ser parte activa del gobierno corporativo.");
  }

  const q9Answer = answers['q9'];
  if (q9Answer !== 2 && calculatedLevel === 5) {
    if (finalLevel > 4) {
      finalLevel = 4;
    }
    if (!alerts.some(a => a.includes("Nivel 5"))) {
      alerts.push("Para alcanzar el Nivel 5, tu empresa necesita una estructura financiera sólida y escalable.");
    }
  }

  return {
    rawScore,
    displayScore,
    calculatedLevel,
    finalLevel,
    alerts,
    questionCount,
    pointsPerQuestion,
  };
}

function getLevel(normalizedScore: number): number {
  if (normalizedScore <= LEVEL_THRESHOLDS[0]) return 1;
  if (normalizedScore <= LEVEL_THRESHOLDS[1]) return 2;
  if (normalizedScore <= LEVEL_THRESHOLDS[2]) return 3;
  if (normalizedScore <= LEVEL_THRESHOLDS[3]) return 4;
  return 5;
}

export function normalizeRawScore(rawScore: number, questionCount: number): number {
  const maxPossible = questionCount * MAX_OPTION_VALUE;
  return maxPossible > 0 ? Math.round((rawScore / maxPossible) * 100) : 0;
}

export function getPointsPerQuestion(questionCount: number): number {
  return questionCount > 0 ? 100 / questionCount : 0;
}

export function getOptionPoints(questionCount: number): { a: number; b: number; c: number } {
  const ppq = getPointsPerQuestion(questionCount);
  return {
    a: ppq * (OPTION_VALUES[0] / MAX_OPTION_VALUE),
    b: ppq * (OPTION_VALUES[1] / MAX_OPTION_VALUE),
    c: ppq * (OPTION_VALUES[2] / MAX_OPTION_VALUE),
  };
}

export function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    1: '#999999',
    2: '#BDD745',
    3: '#A6CC38',
    4: '#0077B6',
    5: '#42C7F5'
  };
  return colors[level] || colors[1];
}
