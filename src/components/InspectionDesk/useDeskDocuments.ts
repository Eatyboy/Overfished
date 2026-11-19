import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'

/** Documents that lie on the desk. */
export type DocId = 'report' | 'license' | 'regulations' | 'blacklist'

/** The desk's front rim (the dark strip along the bottom), which documents shouldn't rest on. */
const DESK_RIM = 24

interface Offset {
  x: number
  y: number
}

interface Drag {
  id: DocId
  pointerId: number
  startX: number
  startY: number
  origin: Offset
  /** Where the document was last moved to. */
  last: Offset
  /** Screen pixels per stage unit, since the stage is scaled to fit the window. */
  scale: number
}

/** Props to spread onto a document's root element to make it draggable. */
export interface DragProps {
  style: CSSProperties
  onPointerDown: (e: PointerEvent<HTMLElement>) => void
  onPointerMove: (e: PointerEvent<HTMLElement>) => void
  onPointerUp: (e: PointerEvent<HTMLElement>) => void
  onPointerCancel: (e: PointerEvent<HTMLElement>) => void
}

/**
 * Offset that keeps `el` fully on the desk. Positions are in stage units relative to the
 * element's laid-out spot (its CSS left/top), which transforms don't change.
 */
function onDesk(el: HTMLElement, o: Offset): Offset {
  const desk = el.offsetParent as HTMLElement | null
  if (!desk) return o
  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max))
  return {
    x: clamp(o.x, -el.offsetLeft, desk.clientWidth - el.offsetWidth - el.offsetLeft),
    y: clamp(o.y, -el.offsetTop, desk.clientHeight - DESK_RIM - el.offsetHeight - el.offsetTop),
  }
}

/** True if the press is on the element's own vertical scrollbar, which should scroll rather than drag. */
function onScrollbar(e: PointerEvent<HTMLElement>): boolean {
  const t = e.target as HTMLElement
  return t.scrollHeight > t.clientHeight && e.nativeEvent.offsetX > t.clientWidth
}

/**
 * Drag-and-drop for the papers on the desk. Any document can be dragged anywhere on screen;
 * pressing one brings it to the front, and dropping it partly or fully off the desk snaps it back on.
 * Positions last while the desk is on screen.
 */
export function useDeskDocuments() {
  const [offsets, setOffsets] = useState<Partial<Record<DocId, Offset>>>({})
  /** Back to front. Documents not yet touched sit below all of these. */
  const [order, setOrder] = useState<DocId[]>([])
  const [dragging, setDragging] = useState<DocId | null>(null)
  const drag = useRef<Drag | null>(null)

  const moved = (d: Drag, e: PointerEvent<HTMLElement>): Offset => ({
    x: d.origin.x + (e.clientX - d.startX) / d.scale,
    y: d.origin.y + (e.clientY - d.startY) / d.scale,
  })

  const drop = (id: DocId, e: PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || d.id !== id || d.pointerId !== e.pointerId) return
    drag.current = null
    setDragging(null)
    // A cancelled pointer may not report a position, so settle where the document last was.
    // Clamp now: React clears e.currentTarget once the handler returns, before a state updater runs.
    const settled = onDesk(e.currentTarget, e.type === 'pointercancel' ? d.last : moved(d, e))
    setOffsets((prev) => ({ ...prev, [id]: settled }))
  }

  return (id: DocId): DragProps => {
    const offset = offsets[id] ?? { x: 0, y: 0 }
    const front = order.indexOf(id)
    return {
      style: {
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        zIndex: front + 2,
        cursor: dragging === id ? 'grabbing' : undefined,
        // No easing while following the pointer; the snap back onto the desk eases (see Paper.module.css).
        transition: dragging === id ? 'none' : undefined,
      },
      onPointerDown: (e) => {
        if (e.button !== 0 || drag.current || onScrollbar(e)) return
        const el = e.currentTarget
        setOrder((prev) => [...prev.filter((d) => d !== id), id])
        el.setPointerCapture(e.pointerId)
        drag.current = {
          id,
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          origin: offset,
          last: offset,
          scale: el.getBoundingClientRect().width / el.offsetWidth || 1,
        }
        setDragging(id)
      },
      onPointerMove: (e) => {
        const d = drag.current
        if (!d || d.id !== id || d.pointerId !== e.pointerId) return
        d.last = moved(d, e)
        setOffsets((prev) => ({ ...prev, [id]: d.last }))
      },
      onPointerUp: (e) => drop(id, e),
      onPointerCancel: (e) => drop(id, e),
    }
  }
}
