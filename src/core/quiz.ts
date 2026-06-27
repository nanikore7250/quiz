import type { Question, QuestionProgress, QuizMode, QuizSession } from '../types';
import { computeWeights, weightedShuffle } from './scheduler';

export function createSession(
  questions: Question[],
  progress: QuestionProgress[],
  mode: QuizMode,
): QuizSession {
  let ordered: Question[];

  if (mode === 'weighted') {
    const weighted = computeWeights(questions, progress);
    ordered = weightedShuffle(weighted);
  } else {
    ordered = [...questions].sort(() => Math.random() - 0.5);
  }

  return { questions: ordered, currentIndex: 0, results: [] };
}

export function currentQuestion(session: QuizSession): Question | null {
  return session.questions[session.currentIndex] ?? null;
}

export function recordAnswer(
  session: QuizSession,
  isCorrect: boolean,
): QuizSession {
  const q = currentQuestion(session);
  if (!q) return session;
  return {
    ...session,
    currentIndex: session.currentIndex + 1,
    results: [...session.results, { questionId: q.id, isCorrect }],
  };
}

export function isFinished(session: QuizSession): boolean {
  return session.currentIndex >= session.questions.length;
}

export function sessionStats(session: QuizSession) {
  const correct = session.results.filter(r => r.isCorrect).length;
  const total = session.results.length;
  return {
    correct,
    total,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
  };
}
