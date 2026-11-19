import { useId } from 'react'
import type { ForgedStamp } from '../../game/types'

interface StampProps {
  kind: 'official' | ForgedStamp
  /** Width and height, in stage pixels. */
  size: number
  className?: string
}

const BLUE = '#2f4e7a'
const RED = '#a5402f'

/**
 * The Port Authority stamp: blue ink, round, "PORT OF SAN DIEGO" around a fish.
 * Each forgery gets exactly one thing wrong: the port named, the ink colour, or the shape.
 */
export function Stamp({ kind, size, className }: StampProps) {
  const ring = `stamp-ring-${useId().replace(/:/g, '')}`
  const ink = kind === 'wrong-ink' ? RED : BLUE
  const port = kind === 'wrong-port' ? 'PORT OF LONG BEACH' : 'PORT OF SAN DIEGO'
  const square = kind === 'wrong-shape'

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${port} stamp`}
      fill="none"
      stroke={ink}
    >
      <defs>
        {/* Clockwise circle starting at the left, so the text runs over the top. */}
        <path id={ring} d="M 14,50 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
      </defs>

      {square ? (
        <>
          <rect x="3" y="3" width="94" height="94" strokeWidth="3.5" />
          <rect x="22" y="22" width="56" height="56" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <circle cx="50" cy="50" r="47" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="27" strokeWidth="1.5" />
        </>
      )}

      <text
        fill={ink}
        stroke="none"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize="8.6"
        fontWeight="700"
      >
        <textPath href={`#${ring}`} textLength="222" lengthAdjust="spacing">
          {port} ★ MARINE INSPECTION ★
        </textPath>
      </text>

      {/* fish */}
      <path d="M 33,50 Q 46,38 60,50 Q 46,62 33,50 Z M 60,50 L 69,42 L 69,58 Z" fill={ink} stroke="none" />
      <circle cx="40" cy="48" r="1.8" fill="#e6dcb8" stroke="none" />
      <text x="50" y="70" fill={ink} stroke="none" fontFamily="'IBM Plex Mono', monospace" fontSize="7" fontWeight="700" textAnchor="middle">
        CLEARED
      </text>
    </svg>
  )
}
