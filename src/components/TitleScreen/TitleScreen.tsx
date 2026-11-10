import { useGameStore } from '../../store/gameStore'
import { HarborScene } from './HarborScene'
import styles from './TitleScreen.module.css'

export function TitleScreen() {
  const startShift = useGameStore((s) => s.startShift)

  return (
    <main className={styles.screen}>
      <HarborScene />

      <p className={styles.eyebrow}>Group 8 · SYN 100</p>
      <h1 className={styles.title}>Overfished</h1>
      <p className={styles.subtitle}>A port inspection game</p>
      <p className={styles.tagline}>Twelve months. One port. Every catch counts.</p>

      <button type="button" className={styles.start} onClick={startShift}>
        Start shift
      </button>

      <p className={styles.footer}>
        Overfished <span aria-hidden="true">·</span> Vol. 01
      </p>
    </main>
  )
}
