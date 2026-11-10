import { Stage } from './components/Stage/Stage'
import { TitleScreen } from './components/TitleScreen/TitleScreen'
import { InspectionDesk } from './components/InspectionDesk/InspectionDesk'
import { useGameStore } from './store/gameStore'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  return <Stage>{screen === 'title' ? <TitleScreen /> : <InspectionDesk />}</Stage>
}
