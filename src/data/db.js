import { openDB } from 'idb';
import { encryptText, decryptToText } from './crypto';
let _db = null;
async function getDB() {
    if (_db)
        return _db;
    _db = await openDB('quiz-app-v1', 1, {
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
export async function saveQuizSet(id, json, version) {
    const data = await encryptText(json);
    const db = await getDB();
    await db.put('quizsets', { id, data, version });
}
export async function loadQuizSet(id) {
    const db = await getDB();
    const record = await db.get('quizsets', id);
    if (!record)
        return null;
    return decryptToText(record.data);
}
export async function getLocalVersion(id) {
    const db = await getDB();
    const record = await db.get('quizsets', id);
    return record?.version ?? -1;
}
// --- 学習進捗 ---
export async function saveProgress(p) {
    const db = await getDB();
    await db.put('progress', { ...p, key: `${p.setId}:${p.questionId}` });
}
export async function loadProgressBySet(setId) {
    const db = await getDB();
    return db.getAllFromIndex('progress', 'by-set', setId);
}
export async function loadOneProgress(setId, questionId) {
    const db = await getDB();
    return db.get('progress', `${setId}:${questionId}`);
}
// --- カタログ ---
export async function saveCatalogMeta(sets) {
    const db = await getDB();
    await db.put('catalog', { sets, fetchedAt: Date.now() }, 'local');
}
export async function loadCatalogMeta() {
    const db = await getDB();
    const record = await db.get('catalog', 'local');
    return record?.sets ?? null;
}
