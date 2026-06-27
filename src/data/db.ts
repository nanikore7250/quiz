import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { encryptText, decryptToText } from './crypto';
import type { QuestionProgress, QuizSetMeta } from '../types';

interface QuizDBSchema extends DBSchema {
  quizsets: {
    key: string;
    value: { id: string; data: ArrayBuffer; version: number };
  };
  progress: {
    key: string;
    value: QuestionProgress;
    indexes: { 'by-set': string };
  };
  catalog: {
    key: 'local';
    value: { sets: QuizSetMeta[]; fetchedAt: number };
  };
}

let _db: IDBPDatabase<QuizDBSchema> | null = null;

async function getDB(): Promise<IDBPDatabase<QuizDBSchema>> {
  if (_db) return _db;
  _db = await openDB<QuizDBSchema>('quiz-app-v1', 1, {
    upgrade(db) {
      db.createObjectStore('quizsets', { keyPath: 'id' });
      const progressStore = db.createObjectStore('progress', { keyPath: 'key' });
      progressStore.createIndex('by-set', 'setId');
      db.createObjectStore('catalog');
    },
  });
  return _db;
}

// --- 問題セット ---

export async function saveQuizSet(id: string, json: string, version: number): Promise<void> {
  const data = await encryptText(json);
  const db = await getDB();
  await db.put('quizsets', { id, data, version });
}

export async function loadQuizSet(id: string): Promise<string | null> {
  const db = await getDB();
  const record = await db.get('quizsets', id);
  if (!record) return null;
  return decryptToText(record.data);
}

export async function getLocalVersion(id: string): Promise<number> {
  const db = await getDB();
  const record = await db.get('quizsets', id);
  return record?.version ?? -1;
}

// --- 学習進捗 ---

export async function saveProgress(p: Omit<QuestionProgress, 'key'>): Promise<void> {
  const db = await getDB();
  await db.put('progress', { ...p, key: `${p.setId}:${p.questionId}` });
}

export async function loadProgressBySet(setId: string): Promise<QuestionProgress[]> {
  const db = await getDB();
  return db.getAllFromIndex('progress', 'by-set', setId);
}

export async function loadOneProgress(
  setId: string,
  questionId: number,
): Promise<QuestionProgress | undefined> {
  const db = await getDB();
  return db.get('progress', `${setId}:${questionId}`);
}

// --- カタログ ---

export async function saveCatalogMeta(sets: QuizSetMeta[]): Promise<void> {
  const db = await getDB();
  await db.put('catalog', { sets, fetchedAt: Date.now() }, 'local');
}

export async function loadCatalogMeta(): Promise<QuizSetMeta[] | null> {
  const db = await getDB();
  const record = await db.get('catalog', 'local');
  return record?.sets ?? null;
}
