/**
 * Pixel-art fishing boat, drawn in absolute coordinates
 * (bounding box roughly x 365–637, y 415–640).
 * Position/scale it with a wrapping <g transform>.
 */
export function Boat() {
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
