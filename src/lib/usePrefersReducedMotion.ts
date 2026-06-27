import { useEffect, useState } from 'react'

/**
 * True when the user wants reduced motion — either via the OS setting
 * (prefers-reduced-motion) or via AccessMap's own toggles (the
 * `a11y-reduce-motion` / `a11y-mode` classes set on <html>).
 *
 * JS animations (WebGL shaders, GSAP loops) can't be stopped by CSS, so
 * they read this hook and bail out of their animation loops entirely.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => check())

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(check())
    mq.addEventListener('change', update)

    // Our own toggles flip classes on <html> — watch for that too.
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => { mq.removeEventListener('change', update); obs.disconnect() }
  }, [])

  return reduced
}

function check(): boolean {
  if (typeof window === 'undefined') return false
  const osPref = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const root = document.documentElement.classList
  return Boolean(osPref) || root.contains('a11y-reduce-motion') || root.contains('a11y-mode')
}
