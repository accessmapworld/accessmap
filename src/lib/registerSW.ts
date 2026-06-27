/**
 * Registers the offline service worker in production builds only (a SW in dev
 * fights Vite's HMR). Safe no-op when the browser lacks service-worker support.
 */
export function registerSW() {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[AccessMap] Service worker registration failed:', err)
    })
  })
}
