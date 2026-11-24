import { useState } from 'react'
import { Boat } from '../pixel/Boat'
import { Px, Sprite, type SpriteRect } from '../pixel/grid'
import { SillClock } from './SillClock'
import { makeRipples } from '../pixel/random'
import pixel from '../pixel/pixel.module.css'
import styles from './HarborWindow.module.css'

/*
 * The booth window looking out on the harbor. The SVG uses stage coordinates
 * (x 0–760, y 64–345) so shapes line up with the Figma frame directly; every shape is snapped
 * to the shared pixel grid (see pixel/grid).
 */

const GLASS = { x: 24, y: 83, right: 742, bottom: 327 }
const HORIZON_Y = 213

const SKYLINE: ReadonlyArray<readonly [number, number, number]> = [
  [24, 172, 80],
  [180, 150, 60],
  [262, 178, 92],
  [380, 160, 70],
  [470, 168, 96],
  [600, 150, 64],
  [680, 174, 62],
]

const RIPPLES = makeRipples({
  x: GLASS.x,
  y: HORIZON_Y + 10,
  width: GLASS.right - GLASS.x - 40,
  height: GLASS.bottom - HORIZON_Y - 16,
  count: 34,
  seed: 21,
  minWidth: 14,
  maxWidth: 56,
})

interface HarborWindowProps {
  vesselNumber: number
  /** Identifies the vessel at the booth. When it changes, the old boat sails out and the new one sails in. */
  arrivalNo: number
  /** Shift clock, in fractional in-game minutes since midnight, swept by the sill clock's hands. */
  minutes: number
}

/** Foam left behind the stern while a boat is under way (Boat coordinates). */
const WAKE: readonly SpriteRect[] = [
  [318, 626, 40, 4, 'var(--water-light)'],
  [282, 634, 28, 4, 'var(--water-light)'],
  [330, 640, 52, 4, 'var(--water-light)'],
  [250, 630, 18, 4, 'var(--water-light)'],
]

/** Placement of the boat at the booth, and of the far boat cruising past. */
const BOOTH = { x: 58, y: -111, scale: 0.63 }
const FAR = { x: 408, y: -16, scale: 0.4 }

function Wake() {
  return (
    <g className={styles.wake}>
      <Sprite rects={WAKE} {...BOOTH} />
    </g>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

export function HarborWindow({ vesselNumber, arrivalNo, minutes }: HarborWindowProps) {
  // The boat at the booth, and the one sailing away after a decision (null once it is out of sight).
  const [docked, setDocked] = useState(arrivalNo)
  const [leaving, setLeaving] = useState<number | null>(null)
  if (docked !== arrivalNo) {
    setLeaving(docked)
    setDocked(arrivalNo)
  }

  return (
    <div className={styles.window}>
      <svg
        className={styles.scene}
        viewBox="0 64 760 281"
        width={760}
        height={281}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="harbor-glass">
            <Px
              x={GLASS.x}
              y={GLASS.y}
              width={GLASS.right - GLASS.x}
              height={GLASS.bottom - GLASS.y}
            />
          </clipPath>
        </defs>

        <g clipPath="url(#harbor-glass)">
          {/* sky + far shore */}
          <Px x={0} y={64} width={760} height={HORIZON_Y - 64} fill="var(--sky)" />
          <Px x={0} y={150} width={760} height={HORIZON_Y - 150} fill="var(--haze)" />
          {SKYLINE.map(([x, y, w]) => (
            <Px key={x} x={x} y={y} width={w} height={HORIZON_Y - y} fill="var(--city)" />
          ))}

          {/* water */}
          <Px x={0} y={HORIZON_Y} width={760} height={GLASS.bottom - HORIZON_Y} fill="var(--water)" />
          <g className={pixel.ripples}>
            {RIPPLES.map((r, i) => (
              <Px
                key={i}
                x={r.x}
                y={r.y}
                width={r.w}
                height={3}
                fill={r.dark ? 'var(--water-dark)' : 'var(--water-light)'}
              />
            ))}
          </g>

          {/* lighthouse, standing on a rocky base at the waterline */}
          <Px x={126} y={83} width={34} height={22} fill="var(--cream)" />
          <Px x={126} y={105} width={34} height={14} fill="var(--city)" />
          <Px x={126} y={119} width={34} height={HORIZON_Y - 8 - 119} fill="var(--cream)" />
          <Px x={137} y={HORIZON_Y - 8 - 31} width={13} height={31} fill="var(--ink)" />
          <Px x={114} y={HORIZON_Y - 8} width={58} height={8} fill="var(--ink-soft)" />
          <Px x={106} y={HORIZON_Y - 4} width={74} height={4} fill="var(--ink-soft)" />

          {/* near pier */}
          <Px x={GLASS.x} y={292} width={370} height={14} fill="var(--ink-soft)" />
          {[60, 130, 200, 290].map((x) => (
            <Px key={x} x={x} y={306} width={12} height={21} fill="var(--teal)" />
          ))}

          {/* a far boat cruising across the harbor */}
          <g className={styles.cruise}>
            <g className={pixel.bobSlow}>
              <Boat {...FAR} />
            </g>
          </g>

          {/* the vessel at the booth: sails in from the left, sails out to the right after a decision */}
            {leaving !== null && (
              <g key={`out-${leaving}`} className={styles.sailOut} onAnimationEnd={(e) => {
                  // Ignore the wake's own animation ending, which bubbles up here.
                  if (e.target === e.currentTarget) setLeaving(null)
                }}>
                <Wake />
                <g className={pixel.bob}>
                  <Boat {...BOOTH} />
                </g>
              </g>
            )}
            <g key={`in-${docked}`} className={styles.sailIn}>
              <Wake />
              <g className={pixel.bob}>
                <Boat {...BOOTH} />
              </g>
            </g>
        </g>

        {/* window frame */}
        <Px x={17} y={79} width={731} height={4} fill="var(--brown)" />
        <Px x={17} y={79} width={7} height={250} fill="var(--brown)" />
        <Px x={742} y={79} width={6} height={250} fill="var(--brown)" />
        <Px x={219} y={83} width={4} height={244} fill="var(--brown)" />
        <Px x={223} y={83} width={10} height={244} fill="var(--ink)" />

        {/* sill */}
        <Px x={0} y={327} width={760} height={14} fill="var(--brown)" />
        <Px x={0} y={327} width={760} height={3} fill="var(--tan)" />

        {/* desk clock standing on the sill */}
        <SillClock minutes={minutes} />
      </svg>

      <p className={styles.vesselTag}>
        Vessel {pad(vesselNumber)}
      </p>
    </div>
  )
}
