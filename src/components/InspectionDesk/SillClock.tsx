import { SHIFT_CLOCK } from '../../data/start'
import styles from './SillClock.module.css'

/*
 * A pixel-art alarm clock standing on the harbor window sill, drawn in the harbor SVG's
 * stage coordinates. Its hands move with the shift clock, in its 15-minute steps.
 */

interface SillClockProps {
  /** Shift clock, in in-game minutes since midnight. */
  minutes: number
}

const CX = 662
const CY = 270
const R = 38
const PX = 4

/** A stepped (pixel) disc of radius `r` around the clock centre, as one rect per 4px row. */
function disc(r: number) {
  const rows: { x: number; y: number; w: number }[] = []
  for (let dy = -r; dy < r; dy += PX) {
    const mid = dy + PX / 2
    const half = Math.round(Math.sqrt(Math.max(0, r * r - mid * mid)) / PX) * PX
    if (half > 0) rows.push({ x: CX - half, y: CY + dy, w: half * 2 })
  }
  return rows
}

const RIM = disc(R + 6)
const FACE = disc(R)
const TICKS = Array.from({ length: 12 }, (_, i) => i * 30)

/** The clock warns for the last hour of the shift, like the header clock. */
const CLOSING_FROM = (SHIFT_CLOCK.endHour - 1) * 60

export function SillClock({ minutes }: SillClockProps) {
  const minuteAngle = (minutes % 60) * 6
  const hourAngle = ((minutes / 60) % 12) * 30
  const closing = minutes >= CLOSING_FROM

  return (
    <g className={closing ? styles.closing : undefined}>
      {/* bells and hammer */}
      <rect x={CX - 40} y={CY - 52} width={22} height={12} fill="var(--tan)" />
      <rect x={CX - 36} y={CY - 56} width={14} height={4} fill="var(--tan)" />
      <rect x={CX + 18} y={CY - 52} width={22} height={12} fill="var(--tan)" />
      <rect x={CX + 22} y={CY - 56} width={14} height={4} fill="var(--tan)" />
      <rect x={CX - 2} y={CY - 54} width={4} height={10} fill="var(--ink)" />

      {/* legs, standing on the sill */}
      <rect x={CX - 30} y={CY + 40} width={8} height={17} fill="var(--ink)" />
      <rect x={CX + 22} y={CY + 40} width={8} height={17} fill="var(--ink)" />

      {/* case and face */}
      {RIM.map((r) => (
        <rect key={`rim${r.y}`} x={r.x} y={r.y} width={r.w} height={PX} className={styles.rim} />
      ))}
      {FACE.map((r) => (
        <rect key={`face${r.y}`} x={r.x} y={r.y} width={r.w} height={PX} fill="var(--cream)" />
      ))}

      {/* hour marks: long ones at 12, 3, 6 and 9 */}
      {TICKS.map((a) => (
        <rect
          key={a}
          x={CX - 2}
          y={CY - R + 4}
          width={4}
          height={a % 90 === 0 ? 8 : 4}
          fill="var(--ink)"
          transform={`rotate(${a} ${CX} ${CY})`}
        />
      ))}

      {/* hands */}
      <rect x={CX - 3} y={CY - 20} width={6} height={22} fill="var(--ink)" transform={`rotate(${hourAngle} ${CX} ${CY})`} />
      <rect x={CX - 2} y={CY - 30} width={4} height={32} className={styles.minute} transform={`rotate(${minuteAngle} ${CX} ${CY})`} />
      <rect x={CX - 4} y={CY - 4} width={8} height={8} fill="var(--ink)" />
    </g>
  )
}
