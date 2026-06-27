/**
 * ルート直下の *_quiz.json を全て処理し gzip 圧縮して
 * public/quizsets/ に出力する。catalog.json も更新する。
 *
 * 実行: npm run build:quizsets
 */
import { gzipSync } from 'zlib';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

interface RawQuestion {
  項番: number;
  問題: string;
  選択肢: string[];
  回答: string;
  解説: string;
}
interface RawQuiz {
  title: string;
  source?: string;
  total_questions: number;
  questions: RawQuestion[];
}

// ルート直下の *_quiz.json を id → ファイル名 でマッピング
const QUIZ_FILES: { id: string; file: string }[] = readdirSync(ROOT)
  .filter(f => f.endsWith('_quiz.json') && f !== 'package.json')
  .map(f => ({ id: f.replace('_quiz.json', ''), file: f }))
  .sort((a, b) => a.id.localeCompare(b.id));

const catalogSets: object[] = [];

for (const { id, file } of QUIZ_FILES) {
  const raw: RawQuiz = JSON.parse(readFileSync(join(ROOT, file), 'utf-8'));

  const quizSet = {
    id,
    title: raw.title,
    source: raw.source ?? '',
    questions: raw.questions.map(q => ({
      id: q['項番'],
      question: q['問題'],
      choices: q['選択肢'],
      answer: q['回答'],
      explanation: q['解説'],
    })),
  };

  const json = JSON.stringify(quizSet);
  const compressed = gzipSync(Buffer.from(json, 'utf-8'), { level: 9 });

  // .bin 拡張子にすることでサーバーが Content-Encoding: gzip を付与するのを防ぐ
  const outFile = `${id}-v1.bin`;
  writeFileSync(join(ROOT, 'public/quizsets', outFile), compressed);
  console.log(`✓ ${outFile}  ${json.length} B → ${compressed.length} B (${Math.round(compressed.length / json.length * 100)}%)`);

  catalogSets.push({
    id,
    title: raw.title,
    file: outFile,
    version: 1,
    count: quizSet.questions.length,
  });
}

const catalog = {
  version: 1,
  updated: new Date().toISOString().slice(0, 10),
  sets: catalogSets,
};

writeFileSync(
  join(ROOT, 'public/quizsets/catalog.json'),
  JSON.stringify(catalog, null, 2),
);
console.log('✓ catalog.json updated');
