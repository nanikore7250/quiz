export interface Question {
  id: number;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  source: string;
  questions: Question[];
}

export interface QuizSetMeta {
  id: string;
  title: string;
  file: string;
  version: number;
  count: number;
}

export interface Catalog {
  version: number;
  updated: string;
  sets: QuizSetMeta[];
}

export interface QuestionProgress {
  key: string;          // `${setId}:${questionId}`
  setId: string;
  questionId: number;
  correctCount: number;
  incorrectCount: number;
  lastAnsweredAt: number;
}

export type QuizMode = 'random' | 'weighted';

export interface QuizSession {
  questions: Question[];
  currentIndex: number;
  results: { questionId: number; isCorrect: boolean }[];
}

export type Screen =
  | { name: 'home' }
  | { name: 'quiz'; setId: string; mode: QuizMode }
  | { name: 'stats'; setId: string };
