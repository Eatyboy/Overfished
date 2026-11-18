import { useEffect, useRef } from 'react'

/** Focuses the returned button on mount and calls `onDismiss` on Escape. */
export function useDismiss(onDismiss: () => void) {
  const button = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    button.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])
  return button
}
