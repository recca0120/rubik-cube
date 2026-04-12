import { CubieDialog } from './Cubie'

const GREETING = '哇～你真的會解了！這邊是進階工具區，可以試試 CFOP、查 F2L 案例，或輸入打亂狀況交給解算器跑 ✨'

type Props = {
  onEnter: () => void
  onExit?: () => void
}

export function ExpertHome({ onEnter, onExit }: Props) {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden px-4 py-6 flex flex-col"
      style={{ background: 'var(--paper)' }}
    >
      <div className="absolute top-3 right-3">
        {onExit && (
          <button
            onClick={onExit}
            className="text-xs font-display px-3 py-1.5 rounded-xl"
            style={{
              background: 'var(--marker-pink)',
              color: 'var(--ink)',
              border: 'var(--border-mid)',
              boxShadow: 'var(--offset-sm)',
            }}
            title="回首頁"
          >
            🏠 回首頁
          </button>
        )}
      </div>

      <div className="max-w-lg mx-auto w-full mt-8 flex-1 flex flex-col justify-center">
        <div className="text-center mb-6 anim-slide">
          <h1 className="font-display text-4xl md:text-5xl" style={{ color: 'var(--ink)' }}>
            🎓 歡迎來到專家工作台
          </h1>
          <div className="font-body text-sm mt-2 opacity-70">
            你畢業了！Cubie 帶你看看這邊
          </div>
        </div>

        <div className="anim-fadeup" style={{ animationDelay: '0.2s' }}>
          <CubieDialog
            emotion="cheering"
            message={GREETING}
            gesture="thumbsup"
            typewriterMs={20}
          />
        </div>

        <div className="mt-8 flex justify-center anim-fadeup" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={onEnter}
            className="hover-wiggle px-8 py-4 rounded-3xl font-display text-2xl active:scale-95 transition-transform"
            style={{
              background: 'var(--marker-purple)',
              color: 'white',
              border: 'var(--border-thick)',
              boxShadow: 'var(--offset-lg)',
              transform: 'rotate(-1deg)',
            }}
          >
            開始使用 →
          </button>
        </div>
      </div>
    </div>
  )
}
