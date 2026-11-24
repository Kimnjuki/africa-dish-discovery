import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Register from main.tsx via virtual:pwa-register so we can force reload
      // when a new SW takes control (Cloudflare was holding old sw.js for hours).
      injectRegister: false,
      includeAssets: ['favicon.ico', 'robots.txt', 'images/**/*'],
      manifest: {
        name: 'LadhaQuest - African Recipes',
        short_name: 'LadhaQuest',
        description: 'Discover authentic African recipes with smart pantry matching. Cook with ingredients you already have.',
        theme_color: '#D97706',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['food', 'lifestyle', 'education'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        // App shell only — recipe catalog stays out of the precache
        globPatterns: ['**/*.{js,css,html,ico,svg,webp}'],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2 MB — skip huge JPGs
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/auth/],
        runtimeCaching: [
          {
            // Recipe REST (capped). App-level offlineStore holds pantry/plan snapshots —
            // do not precache the full catalog.
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/recipes.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'recipes-detail-v3',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache-v3',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          },
          {
            // Public object URLs only — /render/image is not enabled (403).
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-media-v3',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 14
              },
              cacheableResponse: {
                statuses: [200]
              }
            }
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
