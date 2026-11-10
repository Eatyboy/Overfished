import { Boat } from '../pixel/Boat'
import { makeRipples } from '../pixel/random'
import pixel from '../pixel/pixel.module.css'
import styles from './HarborScene.module.css'

/*
 * Pixel-art harbor backdrop for the title screen, drawn in 1440×900 stage units.
 * Colours come from the CSS custom properties in index.css.
 */

const HORIZON_Y = 437

/** Skyline blocks along the far shore: x, top y, width. */
const SKYLINE: ReadonlyArray<readonly [number, number, number]> = [
  [0, 375, 82],
  [96, 362, 104],
  [226, 345, 94],
  [346, 380, 96],
  [470, 360, 114],
  [602, 344, 98],
  [722, 374, 100],
  [868, 364, 88],
  [962, 350, 98],
  [1076, 368, 96],
]

const RIPPLES = makeRipples({
  x: 0,
  y: HORIZON_Y + 14,
  width: 1400,
  height: 900 - HORIZON_Y - 20,
  count: 90,
  seed: 8,
})

const RIGHT_PILINGS = [1085, 1138, 1192, 1246, 1300, 1354, 1408]
const LEFT_PILINGS = [18, 80, 143, 205]

export function HarborScene() {
  return (
    <svg
      className={styles.scene}
      viewBox="0 0 1440 900"
      width={1440}
      height={900}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* sky */}
      <rect width={1440} height={HORIZON_Y} fill="var(--sky)" />
      <rect x={140} y={290} width={172} height={8} fill="var(--sky-streak)" />
      <rect x={935} y={268} width={300} height={8} fill="var(--sky-streak)" />

      {/* far shore */}
      <rect y={355} width={1440} height={HORIZON_Y - 355} fill="var(--haze)" />
      {SKYLINE.map(([x, y, w]) => (
        <g key={x} fill="var(--city)">
          <rect x={x} y={y} width={w} height={HORIZON_Y - y} />
          <rect x={x + 10} y={y - 8} width={Math.round(w * 0.45)} height={8} />
        </g>
      ))}

      {/* water */}
      <rect y={HORIZON_Y} width={1440} height={900 - HORIZON_Y} fill="var(--water)" />
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
      <rect x={113} y={233} width={36} height={12} fill="var(--ink)" />
      <rect x={98} y={245} width={66} height={8} fill="var(--ink)" />
      <rect x={108} y={253} width={46} height={30} fill="var(--ink)" />
      <rect x={121} y={260} width={20} height={14} fill="var(--tan)" />
      <rect x={115} y={283} width={32} height={157} fill="var(--cream)" />
      <rect x={115} y={350} width={32} height={25} fill="var(--brown)" />
      <rect x={129} y={396} width={14} height={44} fill="var(--ink)" />

      {/* crane */}
      <g fill="var(--teal)">
        <rect x={1009} y={232} width={12} height={262} />
        <rect x={845} y={273} width={290} height={8} />
        {/* cable stretches while the hook travels with its end */}
        <rect className={styles.craneCable} x={857} y={281} width={4} height={108} />
        <rect className={styles.craneHook} x={851} y={387} width={16} height={8} />
        <rect x={985} y={300} width={50} height={38} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={905 + i * 12} y={Math.round(268 - i * 4.4)} width={14} height={5} />
        ))}
      </g>
      <rect x={995} y={310} width={28} height={16} fill="var(--city)" />

      {/* left pier */}
      <rect y={543} width={262} height={15} fill="var(--ink-soft)" />
      {LEFT_PILINGS.map((x) => (
        <rect key={x} x={x} y={558} width={15} height={88} fill="var(--teal)" />
      ))}

      {/* warehouse on the right */}
      <rect x={1175} y={345} width={265} height={205} fill="var(--teal)" />
      <rect x={1158} y={330} width={282} height={22} fill="var(--ink)" />
      <rect x={1150} y={344} width={25} height={8} fill="var(--ink)" />
      <rect x={1195} y={388} width={20} height={10} fill="var(--tan)" />
      <rect x={1275} y={405} width={84} height={92} fill="var(--ink-soft)" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={1283} y={416 + i * 16} width={68} height={3} fill="var(--water-dark)" />
      ))}

      {/* warehouse pier */}
      <rect x={1060} y={537} width={120} height={8} fill="var(--brown)" />
      <rect x={1105} y={511} width={28} height={6} fill="var(--ink)" />
      <rect x={1112} y={517} width={14} height={20} fill="var(--ink)" />
      <rect x={1075} y={545} width={365} height={30} fill="var(--ink)" />
      {RIGHT_PILINGS.map((x) => (
        <g key={x}>
          <rect x={x - 4} y={575} width={4} height={145} fill="var(--brown)" />
          <rect x={x} y={575} width={12} height={145} fill="var(--ink)" />
        </g>
      ))}

      {/* boats */}
      <g transform="translate(704 259) scale(0.4)">
        <g className={pixel.bobSlow}>
          <Boat />
        </g>
      </g>
      <g className={pixel.bob}>
        <Boat />
      </g>

      {/* near dock, bottom left */}
      <rect x={42} y={678} width={98} height={68} fill="var(--brown)" />
      <rect x={58} y={678} width={6} height={68} fill="var(--brown-dark)" />
      <rect x={118} y={678} width={6} height={68} fill="var(--brown-dark)" />
      <rect x={140} y={678} width={8} height={68} fill="var(--ink)" />
      <rect x={242} y={694} width={42} height={10} fill="var(--ink)" />
      <rect x={250} y={704} width={26} height={42} fill="var(--ink)" />
      <rect y={746} width={346} height={16} fill="var(--brown)" />
      <rect y={762} width={346} height={138} fill="var(--ink-soft)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} y={774 + i * 14} width={346} height={3} fill="var(--teal)" />
      ))}

      {/* mooring post, bottom right */}
      <rect x={1340} y={690} width={48} height={14} fill="var(--brown)" />
      <rect x={1345} y={704} width={38} height={196} fill="var(--ink)" />
    </svg>
  )
}
