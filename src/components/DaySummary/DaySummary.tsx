import { useGameStore } from '../../store/gameStore'
import { SHOP } from '../../data/economy'
import styles from './DaySummary.module.css'

/** Below this, the ledger warns that the fishery is close to collapse. */
const LOW_BIODIVERSITY = 50

const signed = (n: number) => (n < 0 ? `−$${-n}` : `+$${n}`)

/** Between shifts: the day's ledger and the upgrade shop. */
export function DaySummary() {
  const shift = useGameStore((s) => s.shift)
  const log = useGameStore((s) => s.log)
  const money = useGameStore((s) => s.money)
  const biodiversity = useGameStore((s) => s.biodiversity)
  const owned = useGameStore((s) => s.owned)
  const buy = useGameStore((s) => s.buy)
  const nextDay = useGameStore((s) => s.nextDay)

  const net = log.revenue - log.fines - log.inspectionFees - log.expense
  const bioChange = Math.round(biodiversity - log.biodiversityStart)
  const items = SHOP.filter((item) => shift.day >= item.fromDay)

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>End of Day {shift.day}</h1>
      </header>

      <section className={styles.ledger} aria-label="Day ledger">
        <p className={styles.meta}>Port Authority</p>
        <h2 className={styles.paperTitle}>Ledger</h2>

        <dl className={styles.rows}>
          <dt>Vessels accepted</dt>
          <dd>{log.accepted}</dd>
          <dt>Vessels rejected</dt>
          <dd>{log.rejected}</dd>
          <dt>Inspection errors</dt>
          <dd className={log.mistakes > 0 ? styles.bad : undefined}>{log.mistakes}</dd>
        </dl>

        {log.errors.length > 0 && (
          <ol className={styles.errors} aria-label="Today's inspection errors">
            {log.errors.map((m) => (
              <li key={m.arrivalNo}>
                <span className={styles.errorVessel}>
                  {m.decision === 'accept' ? 'Accepted' : 'Rejected'} {m.vesselName}
                </span>{' '}
                {m.reason}
              </li>
            ))}
          </ol>
        )}

        <dl className={`${styles.rows} ${styles.money}`}>
          <dt>Port fees</dt>
          <dd>{signed(log.revenue)}</dd>
          <dt>Industry complaints</dt>
          <dd className={log.fines > 0 ? styles.bad : undefined}>{signed(-log.fines)}</dd>
          <dt>Paid inspections</dt>
          <dd>{signed(-log.inspectionFees)}</dd>
          <dt>Operating expense</dt>
          <dd>{signed(-log.expense)}</dd>
          <dt className={styles.total}>Net today</dt>
          <dd className={`${styles.total} ${net < 0 ? styles.bad : ''}`}>{signed(net)}</dd>
        </dl>

        <dl className={`${styles.rows} ${styles.money}`}>
          <dt className={styles.total}>Port budget</dt>
          <dd className={styles.total}>${money}</dd>
          <dt>Marine biodiversity</dt>
          <dd className={bioChange < 0 ? styles.bad : undefined}>
            {Math.round(biodiversity)}% ({bioChange >= 0 ? '+' : '−'}
            {Math.abs(bioChange)})
          </dd>
        </dl>

        {biodiversity < LOW_BIODIVERSITY && (
          <p className={styles.alarm}>
            Fish stocks are crashing. Every illegal vessel accepted now brings the fishery closer to collapse.
          </p>
        )}
      </section>

      <section className={styles.shop} aria-label="Shop">
        <h2 className={styles.shopTitle}>Port Upgrades</h2>
        <ul className={styles.items}>
          {items.map((item) => {
            const count = owned[item.id]
            const price = item.price(count)
            const maxed = count >= item.max
            return (
              <li key={item.id} className={styles.item}>
                <div>
                  <h3 className={styles.itemName}>
                    {item.name}
                    {item.max > 1 && count > 0 && <span className={styles.owned}> ×{count}</span>}
                  </h3>
                  <p className={styles.itemText}>{item.description}</p>
                </div>
                <button
                  type="button"
                  className={styles.buy}
                  disabled={maxed || money < price}
                  onClick={() => buy(item.id)}
                >
                  {maxed ? 'Owned' : `$${price}`}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <button type="button" className={styles.next} onClick={nextDay}>
        Begin Day {shift.day + 1}
      </button>
    </main>
  )
}
