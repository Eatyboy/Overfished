export type Rng = () => number

/** Small deterministic PRNG (mulberry32). Same seed, same sequence. */
export function mulberry32(seed: number): Rng {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Integer in [min, max]. */
export function randInt(rand: Rng, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

export function pick<T>(rand: Rng, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]
}

/** `count` distinct items, in random order. */
export function pickDistinct<T>(rand: Rng, items: readonly T[], count: number): T[] {
  const pool = [...items]
  const out: T[] = []
  while (out.length < count && pool.length > 0) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0])
  }
  return out
}
