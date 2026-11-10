/** Small deterministic PRNG so generated scenery looks the same on every render. */
export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

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
