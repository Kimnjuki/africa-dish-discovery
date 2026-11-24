import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Drop runtime caches from pre-fix SW builds (render/image 403s, bad selects).
if (typeof caches !== 'undefined') {
  void caches.keys().then((keys) => {
    for (const key of keys) {
      if (
        key === 'recipes-detail-cache' ||
        key === 'image-cache' ||
        key === 'supabase-media-cache'
      ) {
        void caches.delete(key)
      }
    }
  })
}

// Auto-update: when a new service worker activates, reload once so clients
// leave stale precached shells (old RecipeDetail select /render/image bugs).
registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return
    // Poll for updates — Cloudflare previously cached sw.js for hours.
    const hour = 60 * 60 * 1000
    window.setInterval(() => {
      void registration.update()
    }, hour)
  },
})

createRoot(document.getElementById("root")!).render(<App />);
