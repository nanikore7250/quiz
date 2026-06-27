import type { QuizSetMeta, Screen } from '../types';
import { isSetAvailable } from '../data/catalog';
import { loadProgressBySet } from '../data/db';

export async function HomeScreen(
  container: HTMLElement,
  sets: QuizSetMeta[],
  navigate: (s: Screen) => void,
): Promise<void> {
  container.innerHTML = `
    <div class="screen home-screen">
      <header class="app-header">
        <h1 class="app-title">学習クイズ</h1>
        <p class="app-subtitle">問題セットを選んで学習しよう</p>
        <p class="app-subtitle">※このアプリはオフラインでも学習を継続できます</p>
      </header>
      <main class="sets-list" id="sets-list">
        <div class="loading"><div class="spinner"></div></div>
      </main>
    </div>
  `;

  const listEl = container.querySelector<HTMLElement>('#sets-list')!;

  if (sets.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>問題セットが見つかりません。</p>
        <p class="text-muted">ネットワークに接続して再読み込みしてください。</p>
      </div>
    `;
    return;
  }

  const cards = await Promise.all(
    sets.map(meta => renderSetCard(meta, navigate)),
  );
  listEl.innerHTML = cards.join('');

  sets.forEach(meta => {
    container.querySelector(`[data-action="random"][data-set="${meta.id}"]`)
      ?.addEventListener('click', () => navigate({ name: 'quiz', setId: meta.id, mode: 'random' }));
    container.querySelector(`[data-action="weighted"][data-set="${meta.id}"]`)
      ?.addEventListener('click', () => navigate({ name: 'quiz', setId: meta.id, mode: 'weighted' }));
    container.querySelector(`[data-action="stats"][data-set="${meta.id}"]`)
      ?.addEventListener('click', () => navigate({ name: 'stats', setId: meta.id }));
  });
}

async function renderSetCard(meta: QuizSetMeta, _navigate: (s: Screen) => void): Promise<string> {
  const available = await isSetAvailable(meta.id);
  const progress = available ? await loadProgressBySet(meta.id) : [];

  const answered = progress.filter(p => p.correctCount + p.incorrectCount > 0).length;
  const correct = progress.reduce((s, p) => s + p.correctCount, 0);
  const total = progress.reduce((s, p) => s + p.correctCount + p.incorrectCount, 0);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : null;

  const statsHtml = accuracy !== null
    ? `<div class="set-stats">
        <span class="stat-badge">${answered}/${meta.count}問回答済み</span>
        <span class="stat-badge stat-accuracy">正解率 ${accuracy}%</span>
       </div>`
    : `<div class="set-stats"><span class="stat-badge">未回答</span></div>`;

  if (!available) {
    return `
      <div class="set-card set-card--unavailable">
        <div class="set-card__header">
          <h2 class="set-title">${escHtml(meta.title)}</h2>
          <span class="set-count">${meta.count}問</span>
        </div>
        <p class="text-muted">ネットワークに接続してダウンロードしてください。</p>
      </div>
    `;
  }

  return `
    <div class="set-card">
      <div class="set-card__header">
        <h2 class="set-title">${escHtml(meta.title)}</h2>
        <span class="set-count">${meta.count}問</span>
      </div>
      ${statsHtml}
      <div class="set-actions">
        <button class="btn btn--primary" data-action="random" data-set="${meta.id}">
          ランダム出題
        </button>
        <button class="btn btn--secondary" data-action="weighted" data-set="${meta.id}">
          苦手優先
        </button>
      </div>
      <button class="btn-link" data-action="stats" data-set="${meta.id}">
        統計を見る →
      </button>
    </div>
  `;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
