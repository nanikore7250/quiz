import type { Screen } from '../types';
import { getQuizSet } from '../data/catalog';
import { loadProgressBySet } from '../data/db';

export async function StatsScreen(
  container: HTMLElement,
  setId: string,
  navigate: (s: Screen) => void,
): Promise<void> {
  container.innerHTML = `<div class="screen loading-screen"><div class="spinner"></div></div>`;

  const [quizSet, progress] = await Promise.all([
    getQuizSet(setId),
    loadProgressBySet(setId),
  ]);

  if (!quizSet) {
    container.innerHTML = `<div class="screen"><p class="error">データを読み込めませんでした。</p></div>`;
    return;
  }

  const progressMap = new Map(progress.map(p => [p.questionId, p]));

  const totalCorrect = progress.reduce((s, p) => s + p.correctCount, 0);
  const totalAttempts = progress.reduce((s, p) => s + p.correctCount + p.incorrectCount, 0);
  const overallAccuracy = totalAttempts > 0
    ? Math.round((totalCorrect / totalAttempts) * 100)
    : null;

  const rows = quizSet.questions
    .map(q => {
      const p = progressMap.get(q.id);
      const attempts = (p?.correctCount ?? 0) + (p?.incorrectCount ?? 0);
      const acc = attempts > 0 ? Math.round(((p?.correctCount ?? 0) / attempts) * 100) : null;
      return { q, p, attempts, acc };
    })
    .sort((a, b) => {
      // 未回答 → 正解率低い順 → 正解率高い順
      if (a.acc === null && b.acc === null) return a.q.id - b.q.id;
      if (a.acc === null) return 1;
      if (b.acc === null) return -1;
      return a.acc - b.acc;
    });

  container.innerHTML = `
    <div class="screen stats-screen">
      <header class="stats-header">
        <button class="btn-icon back-btn" id="back-btn" aria-label="ホームへ戻る">←</button>
        <h2 class="stats-title">統計</h2>
      </header>

      <div class="stats-overview">
        <p class="stats-set-name">${escHtml(quizSet.title)}</p>
        ${overallAccuracy !== null
          ? `<div class="overall-accuracy">
               <span class="overall-pct">${overallAccuracy}%</span>
               <span class="overall-label">総合正解率（${totalCorrect}/${totalAttempts}回）</span>
             </div>`
          : `<p class="text-muted">まだ回答していません。</p>`
        }
      </div>

      <div class="question-stats-list">
        ${rows.map(({ q, acc, attempts }) => `
          <div class="qstat-row ${acc !== null && acc < 50 ? 'qstat-row--weak' : ''}">
            <div class="qstat-meta">
              <span class="qstat-num">問${q.id}</span>
              <span class="qstat-pct ${acc === null ? 'text-muted' : ''}">
                ${acc !== null ? `${acc}%` : '未'}
              </span>
            </div>
            <div class="qstat-bar-wrap">
              <div class="qstat-bar" style="width:${acc ?? 0}%"></div>
            </div>
            <p class="qstat-q">${escHtml(q.question)}</p>
            ${attempts > 0
              ? `<p class="qstat-detail text-muted">${attempts}回回答</p>`
              : ''
            }
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#back-btn')!.addEventListener('click', () =>
    navigate({ name: 'home' }),
  );
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
