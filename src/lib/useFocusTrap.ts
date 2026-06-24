import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href],area[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * Traps keyboard focus inside a dialog while `active`, moves focus into it on
 * open, and restores focus to the previously-focused element on close.
 * Attach the returned ref to the dialog container element. (WCAG 2.1.2, 2.4.3)
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(active: boolean) {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    // Move focus into the dialog (first focusable, else the container itself)
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter((el) => el.offsetParent !== null || el === document.activeElement)
    const first = focusables()[0]
    if (first) first.focus()
    else { node.setAttribute('tabindex', '-1'); node.focus() }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) { e.preventDefault(); return }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      const activeEl = document.activeElement as HTMLElement
      if (e.shiftKey) {
        if (activeEl === firstEl || !node!.contains(activeEl)) { e.preventDefault(); lastEl.focus() }
      } else {
        if (activeEl === lastEl || !node!.contains(activeEl)) { e.preventDefault(); firstEl.focus() }
      }
    }

    node.addEventListener('keydown', onKeyDown)
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      // Restore focus to whatever opened the dialog
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus()
    }
  }, [active])

  return ref
}
