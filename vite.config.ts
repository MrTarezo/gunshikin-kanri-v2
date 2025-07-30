// vite.config.ts (PWA対応版)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        // 大きな画像ファイルを除外（背景画像など）
        globIgnores: [
          '**/img/haikei.png',
          '**/img/背景.png',
          '**/img/gunshikin-icon.png',
          '**/img/gunshikin-icon2.png'
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        // AWS Cognito とリアルタイムサービスを除外
        navigateFallbackDenylist: [
          /^https:\/\/cognito-idp\..*\.amazonaws\.com/,
          /^https:\/\/cognito-identity\..*\.amazonaws\.com/,
          /^https:\/\/.*\.appsync-api\..*\.amazonaws\.com/,
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24時間
              },
            },
          },
          // AWS S3 静的アセットのみキャッシュ（認証系は除外）
          {
            urlPattern: /^https:\/\/.*\.s3\..*\.amazonaws\.com\/.*\.(png|jpg|jpeg|gif|webp|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'aws-assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1週間
              },
            },
          },
        ],
        // キャッシュバスティングを無効化しない（適切なバージョニングのため）
      },
      manifest: {
        name: 'GUNSHIKIN-KANRI-V2',
        short_name: 'GUNSHIKIN',
        description: '戦略的家計管理システム - レシート撮影機能付き',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity', 'utilities'],
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'maskable any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable any'
          }
        ],
        shortcuts: [
          {
            name: 'レシート記録',
            short_name: 'レシート',
            description: 'レシートを撮影して支出を記録',
            url: '/?action=add-expense',
            icons: [
              {
                src: '/icons/camera-icon.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          },
          {
            name: '新規作戦',
            short_name: '作戦',
            description: '新しい作戦を立案',
            url: '/?action=add-todo',
            icons: [
              {
                src: '/icons/todo-icon.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ],
        screenshots: [
          {
            src: '/screenshots/dashboard.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'ダッシュボード画面'
          },
          {
            src: '/screenshots/mobile-dashboard.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'モバイル版ダッシュボード'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // より細かいファイル名ハッシュでキャッシュバスティングを強化
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          aws: ['aws-amplify', '@aws-amplify/backend'],
          ui: ['lucide-react'],
        },
      },
    },
  },
})
