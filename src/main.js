import { registerSW } from 'virtual:pwa-register';
import { initApp } from './app';
// Service Worker の登録（オフライン対応）
registerSW({ immediate: true });
initApp();
