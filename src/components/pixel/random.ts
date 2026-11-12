// Scenery uses a seeded PRNG so it looks the same on every render.
import { mulberry32 } from '../../game/random'

export interface Ripple {
  x: number
  y: number
  w: number
  dark: boolean
}

interface RippleArea {
  x: number
  y: number
  width: number
  height: number
  count: number
  seed: number
  minWidth?: number
  maxWidth?: number
}

/** Scatter short horizontal water lines across an area. */
export function makeRipples({
  x,
  y,
  width,
  height,
  count,
  seed,
  minWidth = 18,
  maxWidth = 90,
}: RippleArea): Ripple[] {
  const rand = mulberry32(seed)
  return Array.from({ length: count }, () => ({
    x: Math.round(x + rand() * width),
    y: Math.round(y + rand() * height),
    w: Math.round(minWidth + rand() * (maxWidth - minWidth)),
    dark: rand() < 0.3,
  }))
}
