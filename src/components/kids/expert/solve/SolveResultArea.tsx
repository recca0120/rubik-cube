import { Player } from '@/components/Player'
import { StageChipRow } from '../StageChipRow'
import { ComparePanel } from '../ComparePanel'
import { MoveListPanel } from '../MoveListPanel'
import { Panel } from '@/components/ui/Panel'

export function SolveResultArea() {
  return (
    <section className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="space-y-3">
        <StageChipRow />
        <MoveListPanel />
      </div>
      <div className="space-y-3">
        <ComparePanel />
        <Panel title="🎮 播放控制">
          <Player />
        </Panel>
      </div>
    </section>
  )
}
