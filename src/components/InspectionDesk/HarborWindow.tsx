import { Boat } from '../pixel/Boat'
import { makeRipples } from '../pixel/random'
import pixel from '../pixel/pixel.module.css'
import styles from './HarborWindow.module.css'

/*
 * The booth window looking out on the harbor. The SVG uses stage coordinates
 * (x 0–760, y 64–345) so shapes line up with the Figma frame directly.
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
}

const pad = (n: number) => String(n).padStart(2, '0')

export function HarborWindow({ vesselNumber }: HarborWindowProps) {
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
            <rect
              x={GLASS.x}
              y={GLASS.y}
              width={GLASS.right - GLASS.x}
              height={GLASS.bottom - GLASS.y}
            />
          </clipPath>
        </defs>

        <g clipPath="url(#harbor-glass)">
          {/* sky + far shore */}
          <rect x={0} y={64} width={760} height={HORIZON_Y - 64} fill="var(--sky)" />
          <rect x={0} y={150} width={760} height={HORIZON_Y - 150} fill="var(--haze)" />
          {SKYLINE.map(([x, y, w]) => (
            <rect key={x} x={x} y={y} width={w} height={HORIZON_Y - y} fill="var(--city)" />
          ))}

          {/* water */}
          <rect x={0} y={HORIZON_Y} width={760} height={GLASS.bottom - HORIZON_Y} fill="var(--water)" />
          <g className={pixel.ripples}>
            {RIPPLES.map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.w}
                height={3}
                fill={r.dark ? 'var(--water-dark)' : 'var(--water-light)'}
              />
            ))}
          </g>

          {/* lighthouse */}
          <rect x={126} y={83} width={34} height={22} fill="var(--cream)" />
          <rect x={126} y={105} width={34} height={14} fill="var(--city)" />
          <rect x={126} y={119} width={34} height={70} fill="var(--cream)" />
          <rect x={137} y={158} width={13} height={31} fill="var(--ink)" />

          {/* near pier */}
          <rect x={GLASS.x} y={292} width={370} height={14} fill="var(--ink-soft)" />
          {[60, 130, 200, 290].map((x) => (
            <rect key={x} x={x} y={306} width={12} height={21} fill="var(--teal)" />
          ))}

          {/* boats */}
          <g transform="translate(408 -16) scale(0.4)">
            <g className={pixel.bobSlow}>
              <Boat />
            </g>
          </g>
          <g transform="translate(58 -111) scale(0.63)">
            <g className={pixel.bob}>
              <Boat />
            </g>
          </g>
        </g>

        {/* window frame */}
        <rect x={17} y={79} width={731} height={4} fill="var(--brown)" />
        <rect x={17} y={79} width={7} height={250} fill="var(--brown)" />
        <rect x={742} y={79} width={6} height={250} fill="var(--brown)" />
        <rect x={219} y={83} width={4} height={244} fill="var(--brown)" />
        <rect x={223} y={83} width={10} height={244} fill="var(--ink)" />

        {/* sill */}
        <rect x={0} y={327} width={760} height={14} fill="var(--brown)" />
        <rect x={0} y={327} width={760} height={3} fill="var(--tan)" />
      </svg>

      <p className={styles.vesselTag}>
        Vessel {pad(vesselNumber)}
      </p>
      <p className={styles.plate}>Port entry control</p>
    </div>
  )
}
