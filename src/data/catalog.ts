import type { Catalog, QuizSet, QuizSetMeta } from '../types';
import {
  saveCatalogMeta,
  loadCatalogMeta,
  saveQuizSet,
  loadQuizSet,
  getLocalVersion,
} from './db';
import { decompressGzip } from './decompress';

const CATALOG_URL = '/quizsets/catalog.json';

/**
 * カタログ取得と問題セット同期を行う。
 * ・カタログ取得失敗 → ローカルDBにフォールバック
 * ・セットDL失敗 → コンソールに記録し、次回起動時に再試行
 */
export async function syncCatalog(): Promise<QuizSetMeta[]> {
  let sets: QuizSetMeta[];

  // --- カタログ取得（失敗時はローカルキャッシュ） ---
  try {
    const res = await fetch(CATALOG_URL);
    if (!res.ok) throw new Error(`catalog fetch failed: ${res.status}`);
    const catalog: Catalog = await res.json();
    await saveCatalogMeta(catalog.sets);
    sets = catalog.sets;
  } catch (e) {
    console.warn('[quiz] catalog fetch failed, using local cache:', e);
    sets = (await loadCatalogMeta()) ?? [];
  }

  // --- セットDL（カタログ取得と独立してエラーハンドリング） ---
  for (const meta of sets) {
    const localVersion = await getLocalVersion(meta.id);
    if (localVersion >= meta.version) continue;
    try {
      await downloadQuizSet(meta);
    } catch (e) {
      console.error(`[quiz] failed to download set "${meta.id}":`, e);
    }
  }

  return sets;
}

async function downloadQuizSet(meta: QuizSetMeta): Promise<void> {
  const res = await fetch(`/quizsets/${meta.file}`);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const json = await decompressGzip(buffer);
  await saveQuizSet(meta.id, json, meta.version);
}

/** IndexedDBから問題セットを取得してパースする */
export async function getQuizSet(id: string): Promise<QuizSet | null> {
  const json = await loadQuizSet(id);
  if (!json) return null;
  return JSON.parse(json) as QuizSet;
}

/** 指定セットがローカルにあるか（DL済みか）を確認する */
export async function isSetAvailable(id: string): Promise<boolean> {
  return (await getLocalVersion(id)) >= 0;
}
