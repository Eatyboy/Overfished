import type { ShiftInfo } from '../../game/types'
import styles from './DeskHeader.module.css'

interface DeskHeaderProps {
  shift: ShiftInfo
}

export function DeskHeader({ shift }: DeskHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.day}>Day {shift.day}</h1>
      <p className={styles.location}>
        {shift.location} <span aria-hidden="true">/</span> {shift.booth}
      </p>
      <p className={styles.clock}>
        <time>{shift.time}</time>
        <span aria-hidden="true">•</span>
        <time>{shift.date}</time>
      </p>
    </header>
  )
}
