import { FADE_MS, useGameStore } from '../../store/gameStore'
import styles from './SceneFade.module.css'

/** Black overlay for scene changes. Blocks clicks while it's up so nothing is pressed twice mid-fade. */
export function SceneFade() {
  const fade = useGameStore((s) => s.fade)
  return (
    <div
      className={`${styles.fade} ${fade === 'out' ? styles.black : ''} ${fade ? styles.blocking : ''}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden="true"
    />
  )
}
