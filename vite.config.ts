import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '学習クイズ',
        short_name: '学習クイズ',
        description: 'オフライン対応の4択学習クイズアプリ',
        theme_color: '#2563eb',
        background_color: '#f1f5f9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // 問題セット本体(.bin): 一度DLしたらキャッシュ優先
            urlPattern: /\/quizsets\/.+\.bin$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quizsets-v1',
              expiration: { maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            // カタログ: ネットワーク優先、失敗時はキャッシュ
            urlPattern: /\/quizsets\/catalog\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'catalog-v1',
              networkTimeoutSeconds: 4,
            },
          },
        ],
      },
    }),
  ],
});
