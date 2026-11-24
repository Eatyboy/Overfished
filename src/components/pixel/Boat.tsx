import { Sprite, type Placement, type SpriteRect } from './grid'

/**
 * Pixel-art fishing boat, authored in absolute coordinates (bounding box roughly x 365–637, y 415–640).
 * Place it with `x`, `y` and `scale` rather than a <g transform>, so it snaps to the pixel grid at any size.
 */
const BOAT: readonly SpriteRect[] = [
  // mast, yardarm, flag
  [375, 445, 135, 6, 'var(--ink)'],
  [405, 415, 7, 160, 'var(--ink)'],
  [412, 418, 34, 18, 'var(--tan)'],
  // chimney
  [533, 472, 14, 24, 'var(--brown)'],
  // cabin
  [430, 490, 134, 12, 'var(--ink)'],
  [438, 502, 118, 70, 'var(--cream)'],
  [452, 514, 38, 24, 'var(--ink)'],
  [500, 514, 42, 24, 'var(--ink)'],
  [490, 528, 10, 10, 'var(--teal)'],
  // cargo crates
  [574, 548, 14, 26, 'var(--brown)'],
  [591, 548, 14, 26, 'var(--brown)'],
  // deck rail
  [390, 562, 4, 12, 'var(--cream)'],
  [418, 562, 4, 12, 'var(--cream)'],
  [388, 572, 226, 8, 'var(--cream)'],
  // hull
  [365, 580, 272, 14, 'var(--brown)'],
  [386, 585, 214, 4, 'var(--tan)'],
  [372, 594, 258, 24, 'var(--ink)'],
  [386, 618, 230, 22, 'var(--ink-soft)'],
]

export function Boat(placement: Placement) {
  return <Sprite rects={BOAT} {...placement} />
}
