/**
 * 学習履歴から各問題の重みを計算する。
 * 正解率が低いほど重みが大きく、優先的に出題される。
 */
export function computeWeights(questions, progress) {
    const map = new Map(progress.map(p => [p.questionId, p]));
    return questions.map(q => {
        const p = map.get(q.id);
        if (!p || p.correctCount + p.incorrectCount === 0) {
            return { question: q, weight: 1.5 }; // 未回答は中程度の重み
        }
        const total = p.correctCount + p.incorrectCount;
        const accuracy = p.correctCount / total;
        // accuracy=0 → weight=3.0、accuracy=1 → weight=0.2
        const weight = 0.2 + (1 - accuracy) * 2.8;
        return { question: q, weight };
    });
}
/**
 * 重み付きシャッフル（重みが高いほど早く出題されやすい）。
 */
export function weightedShuffle(weighted) {
    const pool = weighted.map(w => ({ ...w }));
    const result = [];
    while (pool.length > 0) {
        const total = pool.reduce((sum, w) => sum + w.weight, 0);
        let r = Math.random() * total;
        for (let i = 0; i < pool.length; i++) {
            r -= pool[i].weight;
            if (r <= 0) {
                result.push(pool[i].question);
                pool.splice(i, 1);
                break;
            }
        }
    }
    return result;
}
