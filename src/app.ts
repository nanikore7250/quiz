import type { QuizSetMeta, Screen } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { QuizScreen } from './screens/QuizScreen';
import { StatsScreen } from './screens/StatsScreen';
import { syncCatalog } from './data/catalog';
import { initAd, showAd, hideAd } from './ads';

let sets: QuizSetMeta[] = [];
const app = document.getElementById('app')!;

function navigate(screen: Screen): void {
  switch (screen.name) {
    case 'home':
      showAd();
      HomeScreen(app, sets, navigate);
      break;
    case 'quiz':
      hideAd();
      QuizScreen(app, screen.setId, screen.mode, navigate);
      break;
    case 'stats':
      showAd();
      StatsScreen(app, screen.setId, navigate);
      break;
  }
}

export async function initApp(): Promise<void> {
  app.innerHTML = `<div class="screen loading-screen"><div class="spinner"></div></div>`;

  initAd();

  sets = await syncCatalog();

  navigate({ name: 'home' });
}
