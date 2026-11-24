import { useLayoutEffect, useRef } from 'react'
import { SHIFT_CLOCK } from '../../data/start'
import { PX } from '../pixel/grid'
import styles from './SillClock.module.css'

/*
 * A small pixel-art desk clock standing on the harbor window sill, drawn in the harbor SVG's stage
 * coordinates on the shared pixel grid. The clock centre is the middle of one grid cell, so the face,
 * marks and hand are symmetric. It has only an hour hand, one grid pixel wide, which rotates freely,
 * sweeping continuously with the shift clock.
 */

interface SillClockProps {
  /** Shift clock, in (fractional) in-game minutes since midnight. */
  minutes: number
}

/** Centre of the middle cell (cell 664–668, 284–288). */
const CX = 666
const CY = 286
const HALF = PX / 2

/** A cell `i` columns and `j` rows from the centre cell. */
const cell = (i: number, j: number) => ({ x: CX - HALF + i * PX, y: CY - HALF + j * PX, width: PX, height: PX })

/** Face: a pixel disc 13 cells across, one rect per row. */
const FACE_CELLS = 6
const FACE = Array.from({ length: FACE_CELLS * 2 + 1 }, (_, n) => {
  const j = n - FACE_CELLS
  const k = Math.round(Math.sqrt(Math.max(0, (FACE_CELLS + 0.5) ** 2 - j * j)) - 0.5)
  return { x: CX - HALF - k * PX, y: CY - HALF + j * PX, width: (k * 2 + 1) * PX }
})

/** Case: 17 cells square with one-cell corners notched, on a plinth resting on the sill (y 328). */
const CASE_HALF = HALF + 8 * PX
const CASE_TOP = CY - CASE_HALF
const CASE_BOTTOM = CY + CASE_HALF
const SILL_Y = 328

/** Marks at 12, 3, 6 and 9, one cell each, five cells out (all twelve crowd the hands at this size). */
const MARKS = [cell(0, -5), cell(5, 0), cell(0, 5), cell(-5, 0)]

/** The clock warns for the last hour of the shift, like the header clock. */
const CLOSING_FROM = (SHIFT_CLOCK.endHour - 1) * 60

export function SillClock({ minutes }: SillClockProps) {
  const closing = minutes >= CLOSING_FROM
  // The store ticks a few times a second and a matching linear transition fills in between. When time
  // jumps back (a new day), the hand snaps instead of sweeping back.
  const hourAngle = (minutes / 60) * 30
  const prev = useRef(hourAngle)
  const rewound = hourAngle < prev.current
  useLayoutEffect(() => {
    prev.current = hourAngle
  })

  return (
    <g className={closing ? styles.closing : undefined}>
      {/* plinth on the sill */}
      <rect x={CX - CASE_HALF - PX} y={CASE_BOTTOM} width={(CASE_HALF + PX) * 2} height={SILL_Y - CASE_BOTTOM} fill="var(--brown-dark)" />

      {/* case, with notched corners */}
      <rect x={CX - CASE_HALF + PX} y={CASE_TOP} width={(CASE_HALF - PX) * 2} height={CASE_HALF * 2} className={styles.case} />
      <rect x={CX - CASE_HALF} y={CASE_TOP + PX} width={CASE_HALF * 2} height={(CASE_HALF - PX) * 2} className={styles.case} />

      {/* face and hour marks */}
      {FACE.map((r) => (
        <rect key={r.y} {...r} height={PX} fill="var(--cream)" />
      ))}
      {MARKS.map((m, h) => (
        <rect key={h} {...m} fill="var(--ink)" />
      ))}

      {/* hour hand, then the centre pin */}
      <rect
        x={CX - HALF}
        y={CY - 3 * PX}
        width={PX}
        height={3 * PX + HALF}
        fill="var(--ink)"
        className={styles.hand}
        style={{
          transform: `rotate(${hourAngle}deg)`,
          transformOrigin: `${CX}px ${CY}px`,
          transition: rewound ? 'none' : undefined,
        }}
      />
      <rect {...cell(0, 0)} fill="var(--ink)" />
    </g>
  )
}
