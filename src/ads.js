let initialized = false;
const banner = () => document.getElementById('ad-banner');
/** アプリ起動時に一度だけ呼ぶ。オンライン時のみ広告を初期化する。 */
export function initAd() {
    if (!navigator.onLine)
        return;
    try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        initialized = true;
    }
    catch (e) {
        console.warn('[ad] init failed:', e);
    }
    // オフライン切り替え時は非表示
    window.addEventListener('offline', () => banner()?.classList.add('ad-banner--hidden'));
    // オンライン復帰時は、広告初期化済みなら再表示（画面がクイズ以外の場合）
    window.addEventListener('online', () => {
        if (initialized && !banner()?.classList.contains('ad-banner--quiz')) {
            banner()?.classList.remove('ad-banner--hidden');
        }
    });
}
/** ホーム・統計画面: バナーを表示する */
export function showAd() {
    const el = banner();
    if (!el)
        return;
    el.classList.remove('ad-banner--quiz');
    if (navigator.onLine && initialized) {
        el.classList.remove('ad-banner--hidden');
    }
}
/** クイズ画面: バナーを非表示にする */
export function hideAd() {
    const el = banner();
    if (!el)
        return;
    el.classList.add('ad-banner--quiz', 'ad-banner--hidden');
}
