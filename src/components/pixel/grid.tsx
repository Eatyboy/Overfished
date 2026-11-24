import type { SVGProps } from 'react'

/*
 * Every pixel-art scene draws on one grid: an art pixel is PX stage units square. Shapes are authored in
 * Figma stage coordinates and snapped onto the grid when drawn, so scaled sprites keep the same pixel
 * size as everything else instead of shrinking their pixels. Animation distances are multiples of PX too.
 */
export const PX = 4

export const snap = (v: number) => Math.round(v / PX) * PX

/** Snap a rect's edges to the grid. Shared edges snap the same way, so touching shapes stay touching. */
export function snapRect(x: number, y: number, width: number, height: number) {
  const x0 = snap(x)
  const y0 = snap(y)
  return {
    x: x0,
    y: y0,
    width: Math.max(PX, snap(x + width) - x0),
    height: Math.max(PX, snap(y + height) - y0),
  }
}

type PxProps = Omit<SVGProps<SVGRectElement>, 'x' | 'y' | 'width' | 'height'> & {
  x?: number
  y?: number
  width: number
  height: number
}

/** An SVG rect snapped to the pixel grid. */
export function Px({ x = 0, y = 0, width, height, ...rest }: PxProps) {
  return <rect {...snapRect(x, y, width, height)} {...rest} />
}

/** Where a sprite drawn in its own coordinates goes: translated by (x, y) after scaling by `scale`. */
export interface Placement {
  x?: number
  y?: number
  scale?: number
}

export type SpriteRect = readonly [x: number, y: number, width: number, height: number, fill: string]

/** Draw a sprite's rects at a placement, snapped to the grid after scaling. */
export function Sprite({ rects, x = 0, y = 0, scale = 1 }: Placement & { rects: readonly SpriteRect[] }) {
  return (
    <g>
      {rects.map(([rx, ry, w, h, fill], i) => (
        <Px key={i} x={x + rx * scale} y={y + ry * scale} width={w * scale} height={h * scale} fill={fill} />
      ))}
    </g>
  )
}
