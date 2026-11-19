import { Stage } from './components/Stage/Stage'
import { SceneFade } from './components/Stage/SceneFade'
import { TitleScreen } from './components/TitleScreen/TitleScreen'
import { InspectionDesk } from './components/InspectionDesk/InspectionDesk'
import { DaySummary } from './components/DaySummary/DaySummary'
import { GameOver } from './components/GameOver/GameOver'
import { DebugPanel } from './components/Debug/DebugPanel'
import { useGameStore } from './store/gameStore'

/** The debug panel shows in dev builds, or in any build when the URL has `?debug`. */
const debugEnabled = import.meta.env.DEV || new URLSearchParams(window.location.search).has('debug')

const SCREENS = {
  title: TitleScreen,
  desk: InspectionDesk,
  summary: DaySummary,
  gameOver: GameOver,
}

export default function App() {
  const Screen = SCREENS[useGameStore((s) => s.screen)]

  return (
    <>
      <Stage>
        <Screen />
        <SceneFade />
      </Stage>
      {debugEnabled && <DebugPanel />}
    </>
  )
}
