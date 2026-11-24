import type { Tool } from '../../game/types'
import { TOOL_NAMES } from '../../data/economy'
import styles from './VerificationPanel.module.css'

const TOOLS: Tool[] = ['tracking', 'catch', 'license']

const ACTION: Record<Tool, string> = {
  tracking: 'Track vessel',
  catch: 'Inspect catch',
  license: 'Check license',
}

interface VerificationPanelProps {
  /** Port budget, to grey out inspections the port can't afford (the amount shows in the header). */
  money: number
  freeLeft: number
  freeTotal: number
  /** Cost of the next inspection. */
  cost: number
  available: (tool: Tool) => boolean
  /** Tools already used on this vessel (reopening them is free). */
  inspected: Tool[]
  onInspect: (tool: Tool) => void
}

/** The verification tools for the vessel at the booth. */
export function VerificationPanel({ money, freeLeft, freeTotal, cost, available, inspected, onInspect }: VerificationPanelProps) {
  const anyTool = TOOLS.some(available)

  return (
    <section className={styles.panel} aria-label="Verification">
      <div className={styles.row}>
        <p className={styles.quota}>
          Verification Tools
        </p>
      </div>

      <div className={styles.tools}>
        {TOOLS.map((tool) => {
          const unlocked = available(tool)
          const done = inspected.includes(tool)
          const tooPoor = !done && money < cost
          return (
            <button
              key={tool}
              type="button"
              className={`${styles.tool} ${done ? styles.done : ''}`}
              disabled={!unlocked || tooPoor}
              onClick={() => onInspect(tool)}
              title={unlocked ? TOOL_NAMES[tool] : `${TOOL_NAMES[tool]}: not yet available`}
            >
              <span className={styles.action}>{ACTION[tool]}</span>
              <span className={styles.sub}>
                {!unlocked ? 'Locked' : done ? 'View result' : cost === 0 ? 'Free' : `$${cost}`}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
