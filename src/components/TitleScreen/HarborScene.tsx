import styles from './HarborScene.module.css'

/*
 * Pixel-art harbor backdrop for the title screen, drawn in 1440×900 stage units.
 * Colours come from the CSS custom properties in index.css.
 */

const HORIZON_Y = 437

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

interface Ripple extends Rect {
  dark: boolean
}

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

/** Small deterministic PRNG so the ripples look the same on every render. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeRipples(count: number): Ripple[] {
  const rand = mulberry32(8)
  return Array.from({ length: count }, () => ({
    x: Math.round(rand() * 1400),
    y: Math.round(HORIZON_Y + 14 + rand() * (900 - HORIZON_Y - 20)),
    w: Math.round(18 + rand() * 72),
    h: 3,
    dark: rand() < 0.3,
  }))
}

const RIPPLES = makeRipples(90)

const RIGHT_PILINGS = [1085, 1138, 1192, 1246, 1300, 1354, 1408]
const LEFT_PILINGS = [18, 80, 143, 205]

/** The fishing boat, drawn at full size. The distant boat reuses it scaled down. */
function Boat() {
  return (
    <g>
      {/* mast, yardarm, flag */}
      <rect x={375} y={445} width={135} height={6} fill="var(--ink)" />
      <rect x={405} y={415} width={7} height={160} fill="var(--ink)" />
      <rect x={412} y={418} width={34} height={18} fill="var(--tan)" />
      {/* chimney */}
      <rect x={533} y={472} width={14} height={24} fill="var(--brown)" />
      {/* cabin */}
      <rect x={430} y={490} width={134} height={12} fill="var(--ink)" />
      <rect x={438} y={502} width={118} height={70} fill="var(--cream)" />
      <rect x={452} y={514} width={38} height={24} fill="var(--ink)" />
      <rect x={500} y={514} width={42} height={24} fill="var(--ink)" />
      <rect x={490} y={528} width={10} height={10} fill="var(--teal)" />
      {/* cargo crates */}
      <rect x={574} y={548} width={14} height={26} fill="var(--brown)" />
      <rect x={591} y={548} width={14} height={26} fill="var(--brown)" />
      {/* deck rail */}
      <rect x={390} y={562} width={4} height={12} fill="var(--cream)" />
      <rect x={418} y={562} width={4} height={12} fill="var(--cream)" />
      <rect x={388} y={572} width={226} height={8} fill="var(--cream)" />
      {/* hull */}
      <rect x={365} y={580} width={272} height={14} fill="var(--brown)" />
      <rect x={386} y={585} width={214} height={4} fill="var(--tan)" />
      <rect x={372} y={594} width={258} height={24} fill="var(--ink)" />
      <rect x={386} y={618} width={230} height={22} fill="var(--ink-soft)" />
    </g>
  )
}

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
      <g className={styles.ripples}>
        {RIPPLES.map((r, i) => (
          <rect
            key={i}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
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
        <rect x={857} y={281} width={4} height={108} />
        <rect x={851} y={387} width={16} height={8} />
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
        <g className={styles.bobSlow}>
          <Boat />
        </g>
      </g>
      <g className={styles.bob}>
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
