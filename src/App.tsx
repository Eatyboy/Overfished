import { Stage } from './components/Stage/Stage'
import { TitleScreen } from './components/TitleScreen/TitleScreen'
import { InspectionDesk } from './components/InspectionDesk/InspectionDesk'
import { GameOver } from './components/GameOver/GameOver'
import { useGameStore } from './store/gameStore'

const SCREENS = {
  title: TitleScreen,
  desk: InspectionDesk,
  gameOver: GameOver,
}

export default function App() {
  const Screen = SCREENS[useGameStore((s) => s.screen)]

  return (
    <Stage>
      <Screen />
    </Stage>
  )
}
