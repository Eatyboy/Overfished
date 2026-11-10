import { useEffect, useState, type ReactNode } from 'react'
import styles from './Stage.module.css'

/** Design resolution from the Figma frames. Every screen is laid out in these units. */
export const STAGE_WIDTH = 1440
export const STAGE_HEIGHT = 900

function fitScale(): number {
  return Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT)
}

interface StageProps {
  children: ReactNode
}

/**
 * A fixed 1440×900 canvas, scaled uniformly to fit the window (letterboxed),
 * so screens can be positioned in exact Figma coordinates.
 */
export function Stage({ children }: StageProps) {
  const [scale, setScale] = useState(fitScale)

  useEffect(() => {
    const onResize = () => setScale(fitScale())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div className={styles.viewport}>
      <div
        className={styles.stage}
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  )
}
