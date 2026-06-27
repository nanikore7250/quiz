import { getQuizSet } from '../data/catalog';
import { loadProgressBySet, saveProgress, loadOneProgress } from '../data/db';
import { createSession, currentQuestion, recordAnswer, isFinished, sessionStats, } from '../core/quiz';
export async function QuizScreen(container, setId, mode, navigate) {
    renderLoading(container);
    const quizSet = await getQuizSet(setId);
    if (!quizSet) {
        container.innerHTML = `<div class="screen"><p class="error">問題セットを読み込めませんでした。</p></div>`;
        return;
    }
    const progress = await loadProgressBySet(setId);
    const session = createSession(quizSet.questions, progress, mode);
    const state = { session, phase: 'question', selectedChoice: null, mode, answeredQuestion: null };
    render(container, state, setId, navigate, handleAnswer);
    async function handleAnswer(choice) {
        const q = currentQuestion(state.session);
        if (!q || state.phase !== 'question')
            return;
        const isCorrect = choice === q.answer;
        state.selectedChoice = choice;
        state.phase = 'feedback';
        // セッション進行を確定（同期）。フィードバックは answeredQuestion を参照するため
        // currentIndex を進めても表示は壊れない。
        state.answeredQuestion = q;
        state.session = recordAnswer(state.session, isCorrect);
        render(container, state, setId, navigate, handleAnswer);
        // 進捗をDBに永続化（描画とは独立）
        const existing = await loadOneProgress(setId, q.id);
        await saveProgress({
            setId,
            questionId: q.id,
            correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
            incorrectCount: (existing?.incorrectCount ?? 0) + (isCorrect ? 0 : 1),
            lastAnsweredAt: Date.now(),
        });
    }
}
function render(container, state, setId, navigate, handleAnswer) {
    if (state.phase === 'loading') {
        renderLoading(container);
        return;
    }
    if (state.phase === 'summary') {
        renderSummary(container, state.session, setId, state.mode, navigate);
        return;
    }
    const total = state.session.questions.length;
    // feedback中は answeredQuestion を表示（currentIndexは既に次へ進んでいる）。
    // question中は currentQuestion を表示。
    const isFeedback = state.phase === 'feedback';
    const q = isFeedback ? state.answeredQuestion : currentQuestion(state.session);
    // 進捗バー・問番号は表示中の問題の位置に合わせる
    // （feedback中はcurrentIndexが既に+1されているので調整）
    const current = isFeedback ? state.session.currentIndex : state.session.currentIndex + 1;
    container.innerHTML = `
    <div class="screen quiz-screen">
      <header class="quiz-header">
        <button class="btn-icon back-btn" id="back-btn" aria-label="ホームへ戻る">←</button>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${((current - 1) / total) * 100}%"></div>
        </div>
        <span class="progress-label">${current} / ${total}</span>
      </header>

      <div class="quiz-body">
        <div class="question-card">
          <p class="question-number">問 ${current}</p>
          <p class="question-text">${escHtml(q.question)}</p>
        </div>

        <div class="choices" id="choices">
          ${renderChoices(q, state)}
        </div>

        ${state.phase === 'feedback' ? renderFeedback(q, state) : ''}
      </div>
    </div>
  `;
    container.querySelector('#back-btn').addEventListener('click', () => navigate({ name: 'home' }));
    if (state.phase === 'question') {
        container.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => handleAnswer(btn.dataset.choice));
        });
    }
    if (state.phase === 'feedback') {
        container.querySelector('#next-btn')?.addEventListener('click', () => {
            if (isFinished(state.session)) {
                renderSummary(container, state.session, setId, state.mode, navigate);
            }
            else {
                state.phase = 'question';
                state.selectedChoice = null;
                render(container, state, setId, navigate, handleAnswer);
            }
        });
    }
}
function renderChoices(q, state) {
    return q.choices
        .map(choice => {
        let cls = 'choice-btn';
        if (state.phase === 'feedback') {
            if (choice === q.answer)
                cls += ' choice-btn--correct';
            else if (choice === state.selectedChoice)
                cls += ' choice-btn--incorrect';
            else
                cls += ' choice-btn--disabled';
        }
        return `<button class="${cls}" data-choice="${escAttr(choice)}">${escHtml(choice)}</button>`;
    })
        .join('');
}
function renderFeedback(q, state) {
    const isCorrect = state.selectedChoice === q.answer;
    return `
    <div class="feedback-card ${isCorrect ? 'feedback-card--correct' : 'feedback-card--incorrect'}">
      <p class="feedback-label">${isCorrect ? '✓ 正解！' : '✗ 不正解'}</p>
      ${!isCorrect ? `<p class="feedback-answer">正解：${escHtml(q.answer)}</p>` : ''}
      <div class="explanation">
        <p class="explanation-label">解説</p>
        <p class="explanation-text">${escHtml(q.explanation)}</p>
      </div>
      <button class="btn btn--primary" id="next-btn">次の問題 →</button>
    </div>
  `;
}
function renderSummary(container, session, setId, mode, navigate) {
    const { correct, total, accuracy } = sessionStats(session);
    container.innerHTML = `
    <div class="screen summary-screen">
      <div class="summary-card">
        <h2 class="summary-title">セッション完了！</h2>
        <div class="summary-score">
          <span class="score-number">${correct}</span>
          <span class="score-sep"> / </span>
          <span class="score-total">${total}</span>
          <span class="score-unit">問正解</span>
        </div>
        <div class="accuracy-ring">
          <span class="accuracy-pct">${accuracy}%</span>
        </div>
        <div class="summary-actions">
          <button class="btn btn--primary" id="retry-btn">もう一度</button>
          <button class="btn btn--secondary" id="home-btn">ホームへ</button>
          <button class="btn-link" id="stats-btn">統計を見る →</button>
        </div>
      </div>
    </div>
  `;
    container.querySelector('#home-btn').addEventListener('click', () => navigate({ name: 'home' }));
    container.querySelector('#stats-btn').addEventListener('click', () => navigate({ name: 'stats', setId }));
    container.querySelector('#retry-btn').addEventListener('click', () => navigate({ name: 'quiz', setId, mode }));
}
function renderLoading(container) {
    container.innerHTML = `<div class="screen loading-screen"><div class="spinner"></div></div>`;
}
function escHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function escAttr(s) {
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
