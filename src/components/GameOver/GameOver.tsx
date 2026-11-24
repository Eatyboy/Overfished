import { useGameStore } from '../../store/gameStore'
import { formatDate } from '../../game/date'
import { BIODIVERSITY } from '../../data/start'
import { TOOL_NAMES } from '../../data/economy'
import type { Tool } from '../../game/types'
import styles from './GameOver.module.css'

const COPY = {
  collapse: {
    title: 'Collapse',
    body: 'Too much illegal catch slipped through. Marine biodiversity has collapsed and the fishery is closed.',
  },
  bankrupt: {
    title: 'Port closed',
    body: "The port couldn't cover its operating costs and has been shut down. With no inspectors at the docks, illegal catches lands unchecked, and marine biodiversity falls.",
  },
  healthy: {
    title: 'Season complete',
    body: 'You made it through twelve months at the port, and the waters of San Diego are still healthy.',
  },
  depleted: {
    title: 'Fishery depleted',
    body: 'The port stayed open all year, but too much illegal catch got through. The fishery is badly depleted.',
  },
} as const

const TOOLS: Tool[] = ['tracking', 'catch', 'license']

export function GameOver() {
  const outcome = useGameStore((s) => s.outcome) ?? 'complete'
  const biodiversity = useGameStore((s) => s.biodiversity)
  const shift = useGameStore((s) => s.shift)
  const money = useGameStore((s) => s.money)
  const season = useGameStore((s) => s.season)
  const startShift = useGameStore((s) => s.startShift)
  const returnToTitle = useGameStore((s) => s.returnToTitle)

  const ending =
    outcome === 'complete' ? (biodiversity >= BIODIVERSITY.healthyEnding ? 'healthy' : 'depleted') : outcome
  const copy = COPY[ending]
  const missed = TOOLS.filter((t) => season.missedByTool[t] > 0)

  return (
    <main className={`${styles.screen} ${ending === 'healthy' ? '' : styles.collapse}`}>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.body}>{copy.body}</p>
      <p className={styles.stats}>
        Day {shift.day} &nbsp;/&nbsp; {formatDate(shift.date)} &nbsp;/&nbsp; Marine biodiversity {Math.round(biodiversity)}% &nbsp;/&nbsp; Port budget ${money}
      </p>

      <section className={styles.debrief} aria-label="Season debrief">
        <h2 className={styles.debriefTitle}>Your season at the port</h2>
        <dl className={styles.rows}>
          <dt>Vessels inspected</dt>
          <dd>{season.vessels}</dd>
          <dt>Illegal vessels stopped</dt>
          <dd>{season.illegalRejected}</dd>
          <dt>Illegal vessels let through</dt>
          <dd className={season.illegalAccepted > 0 ? styles.bad : undefined}>{season.illegalAccepted}</dd>
          <dt>…with falsified paperwork that looked legal</dt>
          <dd className={season.falsifiedAccepted > 0 ? styles.bad : undefined}>{season.falsifiedAccepted}</dd>
          <dt>Legal vessels turned away</dt>
          <dd>{season.legalRejected}</dd>
        </dl>
        {missed.length > 0 && (
          <p className={styles.note}>
            Verification would have exposed them:{' '}
            {missed.map((t) => `${TOOL_NAMES[t]} ${season.missedByTool[t]}`).join(', ')}.
          </p>
        )}
      </section>

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={startShift}>
          Play again
        </button>
        <button type="button" className={`${styles.button} ${styles.secondary}`} onClick={returnToTitle}>
          Title screen
        </button>
      </div>
    </main>
  )
}
